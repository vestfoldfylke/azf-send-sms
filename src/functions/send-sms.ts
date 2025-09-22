import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { logger } from '@vtfk/logger'

import { MyLinkSmsMessage, SmsMessageEncoding, SmsMessageObfuscateOptions } from '../../types/mylink-sms-message.js'
import { PayloadSmsMessage } from '../../types/payload-sms-message.js'
import { SmsMessageResponse } from '../../types/mylink-sms-message-response'

import { errorHandling } from '../middleware/error-handling.js'
import { HTTPError } from '../lib/HTTPError.js'
import { PayloadSmsMessageValidator } from '../validation/payload-sms-message-validator.js'
import { MyLinkSmsMessageValidator } from '../validation/mylink-sms-message-validator.js'

import { PostAsync } from '../lib/mylink-caller.js'

import { config } from '../config.js'

const myLinkSmsMessageValidator = new MyLinkSmsMessageValidator()
const payloadSmsMessageValidator = new PayloadSmsMessageValidator()

const getMyLinkMessages = (payloadMessage: PayloadSmsMessage, context: InvocationContext): MyLinkSmsMessage[] => {
  const hasScheduledIn = Number.isInteger(payloadMessage.scheduledIn)
  const hasScheduledAt = typeof payloadMessage.scheduledAt === 'string'

  return payloadMessage.receivers.map((receiver): MyLinkSmsMessage => {
    const message: MyLinkSmsMessage = {
      recipient: receiver,
      content: {
        text: payloadMessage.message,
        options: {
          'sms.encoding': SmsMessageEncoding.GSM,
          'sms.obfuscate': SmsMessageObfuscateOptions.ContentAndRecipient,
          'sms.sender': payloadMessage.sender ?? config.defaultSender
        }
      }
    }

    if (payloadMessage.referenceId) {
      // TODO: Add a unique referenceId per message (sequence number)
      message.referenceId = payloadMessage.referenceId
    }

    if ((hasScheduledAt && hasScheduledIn) || hasScheduledAt) {
      message.schedule = {
        absolute: payloadMessage.scheduledAt
      }
    }

    if (hasScheduledIn && !hasScheduledAt) {
      message.schedule = {
        relative: payloadMessage.scheduledIn
      }
    }

    const validationErrors = myLinkSmsMessageValidator.validate(message)
    if (Object.keys(validationErrors).length !== 0) {
      logger('error', ['MyLink SMS message validation failed'], context)
        .catch()
      throw new HTTPError(400, JSON.stringify(validationErrors))
    }

    return message
  })
}

export async function sendSms(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const smsData = await request.json() as PayloadSmsMessage

  const payloadValidationErrors = payloadSmsMessageValidator.validate(smsData)
  if (Object.keys(payloadValidationErrors).length !== 0) {
    logger('error', ['Payload validation failed'], context)
      .catch()
    throw new HTTPError(400, JSON.stringify(payloadValidationErrors))
  }

  const myLinkSmsData: MyLinkSmsMessage[] = getMyLinkMessages(smsData, context)

  logger('info', [`would send ${myLinkSmsData.length} SMS message(s)`], context)
    .catch()

  const response = await PostAsync<SmsMessageResponse>(`${config.myLink.baseUrl}/message`, JSON.stringify(myLinkSmsData), context)

  return {
    status: 200,
    jsonBody: response
  }
}

app.post('sendSms', {
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, sendSms)
})

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { count, countInc } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'

import { MyLinkSmsMessage, MyLinkSmsMessageEncoding, MyLinkSmsMessageObfuscateOptions } from '../../types/mylink-sms-message.js'
import { PayloadSmsMessage } from '../../types/payload-sms-message.js'
import { MyLinkSmsMessageResponse } from '../../types/mylink-sms-message-response'

import { errorHandling } from '../middleware/error-handling.js'
import { HTTPError } from '../lib/HTTPError.js'
import { MetricsPrefix, MetricsResultLabelName, MetricsResultFailedLabelValue, MetricsResultSuccessLabelValue } from '../constants.js'
import { MyLinkSmsMessageValidator } from '../validation/mylink-sms-message-validator.js'
import { PayloadSmsMessageValidator } from '../validation/payload-sms-message-validator.js'
import { PostAsync } from '../lib/mylink-caller.js'

import { config } from '../config.js'

const myLinkSmsMessageValidator = new MyLinkSmsMessageValidator()
const payloadSmsMessageValidator = new PayloadSmsMessageValidator()

const MetricsFilePrefix = 'sendSms'

const getMyLinkObfuscation = (): MyLinkSmsMessageObfuscateOptions => {
  switch (config.myLink.obfuscation) {
    case 'None':
      return null
    case 'Content':
      return MyLinkSmsMessageObfuscateOptions.Content
    case 'ContentAndRecipient':
      return MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
    default:
      return MyLinkSmsMessageObfuscateOptions.Content
  }
}

const getReceiver = (receiver: string): string => {
  if (receiver.startsWith('+')) {
    return receiver
  }
  
  return `+${receiver}`
}

const getMyLinkMessages = (payloadMessage: PayloadSmsMessage, obfuscation: MyLinkSmsMessageObfuscateOptions): MyLinkSmsMessage[] => {
  const hasScheduledIn = Number.isInteger(payloadMessage.scheduledIn)
  const hasScheduledAt = typeof payloadMessage.scheduledAt === 'string'

  return payloadMessage.receivers.map((receiver): MyLinkSmsMessage => {
    const message: MyLinkSmsMessage = {
      recipient: getReceiver(receiver),
      content: {
        text: payloadMessage.message,
        options: {
          'sms.encoding': MyLinkSmsMessageEncoding.GSM,
          'sms.sender': payloadMessage.sender ?? config.defaultSender
        }
      }
    }

    if (obfuscation) {
      message.content.options['sms.obfuscate'] = obfuscation
    }

    if (payloadMessage.referenceId) {
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
      logger('error', ['MyLink SMS message validation failed'])
        .catch()
      count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultFailedLabelValue])
      throw new HTTPError(400, JSON.stringify(validationErrors))
    }

    return message
  })
}

export async function sendSms(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const smsData = await request.json() as PayloadSmsMessage

  const payloadValidationErrors = payloadSmsMessageValidator.validate(smsData)
  if (Object.keys(payloadValidationErrors).length !== 0) {
    logger('error', ['Payload validation failed'])
      .catch()
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(400, JSON.stringify(payloadValidationErrors))
  }

  const obfuscation = getMyLinkObfuscation()
  const myLinkSmsData: MyLinkSmsMessage[] = getMyLinkMessages(smsData, obfuscation)

  logger('info', [`Sending ${myLinkSmsData.length} SMS message(s) ${obfuscation ? `with ${obfuscation} obfuscation` : 'without obfuscation'}`])
    .catch()

  try {
    const response = await PostAsync<MyLinkSmsMessageResponse>(`${config.myLink.baseUrl}/messages`, JSON.stringify(myLinkSmsData))
    logger('info', [`Sent ${myLinkSmsData.length} SMS message(s)`, JSON.stringify(response.messages)])
      .catch()
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultSuccessLabelValue])
    countInc(`${MetricsPrefix}_${MetricsFilePrefix}_count`, 'Number of SMS sent to Provider', myLinkSmsData.length, [MetricsResultLabelName, MetricsResultSuccessLabelValue])

    return {
      status: 200,
      jsonBody: response
    }
  } catch (error) {
    logger('error', [`Failed to send ${myLinkSmsData.length} SMS message(s)`])
      .catch()
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultSuccessLabelValue])
    countInc(`${MetricsPrefix}_${MetricsFilePrefix}_count`, 'Number of SMS sent to Provider', myLinkSmsData.length, [MetricsResultLabelName, MetricsResultFailedLabelValue])

    throw error
  }
}

app.post('sendSms', {
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, sendSms)
})

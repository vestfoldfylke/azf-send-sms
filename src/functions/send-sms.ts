import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { logger } from '@vtfk/logger'

import { MyLinkSmsMessage, SmsMessageEncoding, SmsMessageObfuscateOptions } from '../../types/mylink-sms-message.js'
import { PayloadSmsMessage } from '../../types/payload-sms-message.js'

import { errorHandling } from '../middleware/error-handling.js'
import { HTTPError } from '../lib/HTTPError.js'
import { PayloadSmsMessageValidator } from '../validation/payload-sms-message-validator.js';
import { MyLinkSmsMessageValidator } from '../validation/mylink-sms-message-validator.js'

const defaultSender = 'Rumpelo'

const myLinkSmsMessageValidator = new MyLinkSmsMessageValidator()
const payloadSmsMessageValidator = new PayloadSmsMessageValidator()

export async function sendSms(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const smsData = await request.json() as PayloadSmsMessage

  const payloadValidationErrors = payloadSmsMessageValidator.validate(smsData)
  if (Object.keys(payloadValidationErrors).length !== 0) {
    logger('error', ['Payload validation failed'], context)
    throw new HTTPError(400, JSON.stringify(payloadValidationErrors))
  }
  
  const myLinkSmsData: MyLinkSmsMessage[] = []
  
  const hasScheduledIn = Number.isInteger(smsData.scheduledIn)
  const hasScheduledAt = typeof smsData.scheduledAt === 'string'
  
  smsData.receivers.forEach(receiver => {
    const message: MyLinkSmsMessage = {
      recipient: receiver,
      content: {
        text: smsData.message,
        options: {
          "sms.encoding": SmsMessageEncoding.GSM,
          "sms.obfuscate": SmsMessageObfuscateOptions.ContentAndRecipient,
          "sms.sender": smsData.sender ?? defaultSender
        }
      }
    }
    
    if (smsData.referenceId) {
      // TODO: Add a unique referenceId per message (sequence number)
      message.referenceId = smsData.referenceId
    }
    
    if ((hasScheduledAt && hasScheduledIn) || hasScheduledAt) {
      message.schedule = {
        absolute: smsData.scheduledAt
      }
    }
    
    if (hasScheduledIn && !hasScheduledAt) {
      message.schedule = {
        relative: smsData.scheduledIn
      }
    }
    
    const validationErrors = myLinkSmsMessageValidator.validate(message)
    if (Object.keys(validationErrors).length !== 0) {
      logger('error', ['MyLink SMS message validation failed'], context)
      throw new HTTPError(400, JSON.stringify(validationErrors))
    }
    
    myLinkSmsData.push(message)
  })
  
  logger('info', [`would send ${myLinkSmsData.length} SMS message(s)`], context)
  
  return {
    status: 200,
    jsonBody: myLinkSmsData
  }
}

app.post('sendSms', {
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, sendSms)
})

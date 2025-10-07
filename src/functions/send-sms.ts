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

const getScheduledString = (scheduledIn?: number, scheduledAt?: string): string => {
  if (typeof scheduledAt === 'string') {
    return `at ${scheduledAt}`
  }

  if (Number.isInteger(scheduledIn)) {
    const scheduledInSeconds = scheduledIn / 1000
    return `in ${scheduledInSeconds / 60} minutes (${scheduledInSeconds} seconds)`
  }

  return ''
}

const getMyLinkMessages = (payloadMessage: PayloadSmsMessage, obfuscation: MyLinkSmsMessageObfuscateOptions, hasScheduledIn: boolean, hasScheduledAt: boolean): MyLinkSmsMessage[] => {
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

  const hasScheduledIn = Number.isInteger(smsData.scheduledIn)
  const hasScheduledAt = typeof smsData.scheduledAt === 'string'
  const scheduledString = getScheduledString(smsData.scheduledIn, smsData.scheduledAt)
  const obfuscation = getMyLinkObfuscation()

  const myLinkSmsData: MyLinkSmsMessage[] = getMyLinkMessages(smsData, obfuscation, hasScheduledIn, hasScheduledAt)

  logger('info', [`${hasScheduledIn || hasScheduledAt ? 'Scheduling' : 'Sending'} ${myLinkSmsData.length} SMS message(s) ${obfuscation ? `with ${obfuscation} obfuscation` : 'without obfuscation'}${hasScheduledIn || hasScheduledAt ? ` ${scheduledString}` : ''}`])
    .catch()

  try {
    const response = await PostAsync<MyLinkSmsMessageResponse>(`${config.myLink.baseUrl}/messages`, JSON.stringify(myLinkSmsData))
    logger('info', [`${hasScheduledIn || hasScheduledAt ? 'Scheduled' : 'Sent'} ${myLinkSmsData.length} SMS message(s)${hasScheduledIn || hasScheduledAt ? ` ${scheduledString}` : ''}`, JSON.stringify(response.messages)])
      .catch()
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultSuccessLabelValue])
    countInc(`${MetricsPrefix}_${MetricsFilePrefix}_count`, 'Number of SMS sent to Provider', myLinkSmsData.length, [MetricsResultLabelName, MetricsResultSuccessLabelValue])

    return {
      status: 200,
      jsonBody: response
    }
  } catch (error) {
    logger('error', [`Failed to ${hasScheduledIn || hasScheduledAt ? 'schedule' : 'send'} ${myLinkSmsData.length} SMS message(s)${hasScheduledIn || hasScheduledAt ? ` ${scheduledString}` : ''}`, JSON.stringify(myLinkSmsData)])
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

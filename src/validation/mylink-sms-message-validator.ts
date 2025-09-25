import { Validator } from 'fluentvalidation-ts'

import {
  MyLinkMessageCallback, MyLinkMessageCallbackMode,
  MyLinkMessageExpiration, MyLinkMessagePriority,
  MyLinkMessageSchedule,
  MyLinkSmsMessage,
  MyLinkSmsMessageContent,
  MyLinkSmsMessageEncoding,
  MyLinkSmsMessageObfuscateOptions,
  MyLinkSmsMessageOptions
} from '../../types/mylink-sms-message.js'

export class MyLinkSmsMessageValidator extends Validator<MyLinkSmsMessage> {
  constructor() {
    super()
    
    this.ruleFor('recipient')
      .notNull()
      .notEmpty()
      .withMessage('is required')
      .matches(/^\+.*$/)
      .withMessage('must be in MSISDN format (start with + and country code)')
    
    this.ruleFor('content')
      .notNull()
      .withMessage('is required')
      .must(content => content as MyLinkSmsMessageContent !== undefined)
      .withMessage('must be of type MyLinkSmsMessageContent')
      .setValidator(() => new SmsMessageContentValidator())
    
    this.ruleFor('schedule')
      .notNull()
      .setValidator(() => new MessageScheduleValidator())
      .when(v => v.schedule !== undefined && v.schedule !== null)

    this.ruleFor('expiration')
      .must(expiration => expiration as MyLinkMessageExpiration !== undefined)
      .withMessage('must be of type MyLinkMessageExpiration')
      .setValidator(() => new MessageExpirationValidator())
      .when(v => v.expiration !== undefined && v.expiration !== null)

    this.ruleFor('callback')
      .must(callback => callback as MyLinkMessageCallback !== undefined)
      .withMessage('must be of type MyLinkMessageCallback')
      .setValidator(() => new MessageCallbackValidator())
      .when(v => v.callback !== undefined && v.callback !== null)

    this.ruleFor('referenceId')
      .notNull()
      .maxLength(500)
      .withMessage('must not be greater than 500 characters')
      .when(v => v.referenceId !== undefined && v.referenceId !== null)

    this.ruleFor('priority')
      .notEmpty()
      .when(v => v.priority !== undefined && v.priority !== null)
      .must(priority => Object.values(MyLinkMessagePriority).includes(priority))
      .withMessage(`must be one of: ${Object.values(MyLinkMessagePriority).join(', ')}`)
      .when(v => v.priority !== undefined && v.priority !== null)
  }
}

class SmsMessageContentValidator extends Validator<MyLinkSmsMessageContent> {
  constructor() {
    super()
    
    this.ruleFor('text')
      .notNull()
      .notEmpty()
      .withMessage('is required')
      .maxLength(38862)
      .withMessage('must be greater than or equal to 0 and less than or equal to 38862 characters')
    
    this.ruleFor('options')
      .notNull()
      .withMessage('is required')
      .setValidator(() => new SmsMessageOptionsValidator())
  }
}

class SmsMessageOptionsValidator extends Validator<MyLinkSmsMessageOptions> {
  constructor() {
    super()

    this.ruleFor('sms.encoding')
      .must(encoding => Object.values(MyLinkSmsMessageEncoding).includes(encoding))
      .withMessage(`must be one of: ${Object.values(MyLinkSmsMessageEncoding).join(', ')}`)
    
    this.ruleFor('sms.sender')
      .notNull()
      .notEmpty()
      .withMessage('is required')
      .matches(/^(\+?[0-9]{1,15}|[A-Za-z0-9\s+\-\/'"!#%&()*.?><;]{1,11})$/)
      .withMessage('must be alphanumeric (max 11 characters) or numeric (max 15 digits, can start with +)')

    this.ruleFor('sms.obfuscate')
      .notEmpty()
      .withMessage('is required')
      .when(v => v['sms.obfuscate'] !== undefined && v['sms.obfuscate'] !== null)
      .must(obfuscate => Object.values(MyLinkSmsMessageObfuscateOptions).includes(obfuscate))
      .withMessage(`must be one of: ${Object.values(MyLinkSmsMessageObfuscateOptions).join(', ')}`)
      .when(v => v !== undefined && v !== null)
  }
}

class MessageScheduleValidator extends Validator<MyLinkMessageSchedule> {
  constructor() {
    super()
    
    this.ruleFor('relative')
      .notNull()
      .greaterThanOrEqualTo(1)
      .lessThanOrEqualTo(7889232000)
      .withMessage('must be between (inclusive) 1 and 7889232000 milliseconds (3 months)')
      .when(v => v.absolute === undefined || v.absolute === null)

    this.ruleFor('absolute')
      .notNull()
      .notEmpty()
      .must(absolute => !isNaN(Date.parse(absolute)))
      .withMessage('must be an ISO8601 formatted date string in UTC')
      .when(v => v.relative === undefined || v.relative === null)
    
    this.ruleFor('tag')
      .minLength(0)
      .maxLength(100)
      .withMessage('must be between (inclusive) 0 and 100 characters')
      .matches(/[a-zA-Z0-9_-]+$/)
      .withMessage('can only contain alphanumeric characters, underscores and hyphens')
      .when(v => v.tag !== undefined && v.tag !== null && v.tag !== '')
  }
}

class MessageExpirationValidator extends Validator<MyLinkMessageExpiration> {
  constructor() {
    super()

    this.ruleFor('relative')
      .notNull()
      .greaterThanOrEqualTo(1)
      .lessThanOrEqualTo(172800000)
      .withMessage('must be between (inclusive) 1 and 172800000 milliseconds (48 hours)')
      .when(v => v.relative !== undefined && v.relative !== null)

    this.ruleFor('absolute')
      .notNull()
      .notEmpty()
      .must(absolute => !isNaN(Date.parse(absolute)))
      .withMessage('must be an ISO8601 formatted date string in UTC')
      .when(v => v.absolute !== undefined && v.absolute !== null)
  }
}

class MessageCallbackValidator extends Validator<MyLinkMessageCallback> {
  constructor() {
    super()

    this.ruleFor('mode')
      .notEmpty()
      .withMessage('is required')
      .when(v => v.mode !== undefined && v.mode !== null)
      .must(mode => Object.values(MyLinkMessageCallbackMode).includes(mode))
      .withMessage(`must be one of: ${Object.values(MyLinkMessageCallbackMode).join(', ')}`)
      .when(v => v.mode !== undefined && v.mode !== null)
    
    this.ruleFor('urls')
      .notNull()
      .must(urls => Array.isArray(urls) && (urls as string[]).length > 0)
      .withMessage('is required when mode is URL')
      .when(v => (v as MyLinkMessageCallback).mode === MyLinkMessageCallbackMode.URL)
    
    this.ruleFor('gateId')
      .notNull()
      .notEmpty()
      .withMessage('is required when mode is Gate')
      .when(v => (v as MyLinkMessageCallback).mode === MyLinkMessageCallbackMode.Gate)
    
    this.ruleFor('ttl')
      .notNull()
      .greaterThanOrEqualTo(0)
      .lessThanOrEqualTo(28800000)
      .withMessage('must be between (inclusive) 0 and 28800000 milliseconds (8 hours)')
      .when(v => {
        const callback = v as MyLinkMessageCallback
        if (callback === undefined) {
          return false
        }
        
        if (callback.ttl === undefined || callback.ttl === null) {
          return false
        }
        
        return callback.mode === MyLinkMessageCallbackMode.Profile || callback.mode === MyLinkMessageCallbackMode.URL || callback.mode === MyLinkMessageCallbackMode.Gate
      })
  }
}
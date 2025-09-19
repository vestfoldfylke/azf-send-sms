import { Validator } from 'fluentvalidation-ts'
import { PayloadSmsMessage } from '../../types/payload-sms-message.js'

export class PayloadSmsMessageValidator extends Validator<PayloadSmsMessage> {
  constructor() {
    super()
    
    this.ruleFor('receivers')
      .must(receivers => Array.isArray(receivers))
      .withMessage('must be an array of strings')
    
    this.ruleFor('message')
      .notNull()
      .notEmpty()
      .withMessage('must be a non-empty string')
  }
}
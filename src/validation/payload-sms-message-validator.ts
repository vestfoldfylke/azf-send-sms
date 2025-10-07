import { Validator } from 'fluentvalidation-ts'

import { PayloadSmsMessage } from '../../types/payload-sms-message.js'

export class PayloadSmsMessageValidator extends Validator<PayloadSmsMessage> {
  constructor() {
    super()
    
    this.ruleFor('receivers')
      .must(receivers => receivers.length > 0 && receivers.length <= 1000)
      .withMessage('must contain between 1 and 1000 receivers')
      .must(receivers => receivers.every(r => typeof r === 'string'))
      .withMessage('must be an array of strings only')
    
    this.ruleFor('message')
      .notNull()
      .notEmpty()
      .withMessage('must be a non-empty string')
  }
}
import assert from 'node:assert'
import { describe, it } from 'node:test'

import { PayloadSmsMessage } from '../types/payload-sms-message'

import { PayloadSmsMessageValidator } from '../src/validation/payload-sms-message-validator'

const validator = new PayloadSmsMessageValidator()

describe('PayloadSmsMessageValidator should not return errors for valid PayloadSmsMessage', () => {
  it('when receiver format is {countrycode}{number}, +{countrycode}{number} and 00{countrycode}{number}', () => {
    const message: PayloadSmsMessage = {
      receivers: ['4781549300', '+4781549300', '004781549300'],
      message: 'Hello, this is a test message'
    }
    
    const errors = validator.validate(message)
    assert.ok(Object.keys(errors).length === 0, `Expected no validation errors, but got: ${JSON.stringify(errors)}`)
  })
})

describe('PayloadSmsMessageValidator should return errors for invalid PayloadSmsMessage', () => {
  it('when receiver format is {number} and +{number}', () => {
    const message: PayloadSmsMessage = {
      receivers: ['81549300', '+81549300'],
      message: 'Hello, this is a test message'
    }

    const errors = validator.validate(message)
    assert.ok(Object.keys(errors).length === 1, `Expected validation errors, but got: ${JSON.stringify(errors)}`)
  })
})
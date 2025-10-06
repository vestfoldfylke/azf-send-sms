import assert from 'node:assert'
import { describe, it } from 'node:test'

import { MyLinkMessageCallbackMode, MyLinkMessagePriority, MyLinkSmsMessage, MyLinkSmsMessageEncoding, MyLinkSmsMessageObfuscateOptions } from '../types/mylink-sms-message'

import { MyLinkSmsMessageValidator } from '../src/validation/mylink-sms-message-validator'

const validator = new MyLinkSmsMessageValidator()

describe('MyLinkSmsMessageValidator should not return errors for valid MyLinkSmsMessage', () => {
  it('when 4 MyLinkSmsMessage items should be sent immediately', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+4781549300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        expiration: {
          relative: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        },
        callback: {
          mode: MyLinkMessageCallbackMode.Profile
        },
        referenceId: 'ref-12345',
        priority: MyLinkMessagePriority.Normal
      },
      {
        recipient: '+4781549301',
        content: {
          text: 'Hello, this is a second test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo 2',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.Content
          }
        },
        expiration: {
          absolute: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours in the future
        },
        callback: {
          mode: MyLinkMessageCallbackMode.URL,
          urls: ['https://my.callback.url/endpoint']
        },
        referenceId: 'ref-123456',
        priority: MyLinkMessagePriority.High
      },
      {
        recipient: '+4781549302',
        content: {
          text: 'Hello, this is a third test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo 3'
          }
        },
        expiration: {
          relative: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        },
        callback: {
          mode: MyLinkMessageCallbackMode.Gate,
          gateId: 'callbackId'
        },
        referenceId: 'ref-123456',
        priority: MyLinkMessagePriority.Low
      },
      {
        recipient: '+4781549303',
        content: {
          text: 'Hello, this is a fourth test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo 4',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        expiration: {
          absolute: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours in the future
        },
        callback: {
          mode: MyLinkMessageCallbackMode.None
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      assert.ok(Object.keys(errors).length === 0, `Expected no validation errors, but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when 2 MyLinkSmsMessage items should be sent later', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+4781549300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          relative: 60 * 60 * 1000, // 1 hour in milliseconds
          tag: 'test-schedule'
        },
        referenceId: 'ref-12345',
        priority: MyLinkMessagePriority.Normal
      },
      {
        recipient: '+4781549301',
        content: {
          text: 'Hello, this is second test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo 2',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.Content
          }
        },
        schedule: {
          absolute: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour in the future
          tag: 'test-schedule'
        },
        referenceId: 'ref-123456',
        priority: MyLinkMessagePriority.Normal
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      assert.ok(Object.keys(errors).length === 0, `Expected no validation errors, but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })
})

describe('MyLinkSmsMessageValidator should return errors for invalid MyLinkSmsMessage', () => {
  it('when recipient is empty', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it("when recipient doesn't start with '+'", () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when content.text is empty', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: '',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when content.options."sms.encoding" is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': 'Test' as MyLinkSmsMessageEncoding,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when content.options."sms.sender" is empty', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: '',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': '',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when content.options."sms.sender" is more than 15 digits', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': '1234567898765432',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when content.options."sms.sender" is more than 11 alphanumeric characters', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'hello4567129'
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when content.options."sms.obfuscate" is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': 'Test' as MyLinkSmsMessageObfuscateOptions
          }
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.relative is below minimum (0)', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          relative: 0
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.relative is below minimum (500_000)', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          relative: 500_000
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.relative is above maximum (7_889_232_001)', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          relative: 7_889_232_001
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.absolute is invalid date', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          absolute: 'invalid-date'
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.absolute is empty', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          absolute: ''
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.absolute is below minimum (9 minutes)', () => {
    const futureDate: string = new Date(Date.now() + 9 * 60 * 1000).toISOString()
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          absolute: futureDate
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.absolute is above maximum (3 months and 1 minute)', () => {
    const futureDate: string = new Date(Date.now() + 60_000 + 7_889_232_000).toISOString()
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          absolute: futureDate
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.relative and schedule.absolute is missing', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          tag: 'test-tag'
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when schedule.tag is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          relative: 10,
          tag: 'Dette er en test-tag for rumpelo, som er såpass lang og meningsløs at den uten problemer oppfyller alle krav til både lengde og svada, og samtidig nevner rumpelo eksplisitt for å gjøre testen komplett.'
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  // TODO: Check this live when we have a system that supports it
  /*it('when schedule.tag is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        schedule: {
          relative: 10,
          tag: 'Påse at væskeinnholdet er ødelagt'
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      console.log(errors)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })*/

  it('when expiration.relative is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        expiration: {
          relative: 0
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when expiration.relative is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        expiration: {
          relative: 172800001
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when expiration.absolute is empty', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        expiration: {
          absolute: ''
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when expiration.absolute is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        expiration: {
          absolute: 'invalid-date'
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when callback.mode is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        callback: {
          mode: 'Test' as MyLinkMessageCallbackMode
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when callback.mode is URL but urls is null', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        callback: {
          mode: MyLinkMessageCallbackMode.URL,
          urls: null
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when callback.mode is URL but urls are empty', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        callback: {
          mode: MyLinkMessageCallbackMode.URL,
          urls: []
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when callback.mode is Gate but gateId is null', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        callback: {
          mode: MyLinkMessageCallbackMode.Gate,
          gateId: null
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when callback.mode is Gate but gateId is empty', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        callback: {
          mode: MyLinkMessageCallbackMode.Gate,
          gateId: ''
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when callback.ttl invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        callback: {
          mode: MyLinkMessageCallbackMode.Profile,
          ttl: 28800001
        }
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when referenceId is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        referenceId: 'Dette er en svada tekst som er laget for å overstige 500 tegn. Den inneholder mange ord, setninger og uttrykk som egentlig ikke har noen spesiell mening, men som er ment å fylle opp plassen slik at vi kan teste valideringen av referenceId-feltet i MyLinkSmsMessageValidator. Her kan vi skrive om alt mulig rart, som for eksempel at rumpeloen danser rundt i stua mens han tenker på hvor mange tegn denne teksten egentlig har blitt, og om det er nok til å passere grensen på 500 tegn. Kanskje han også vurderer å telle bokstavene manuelt, men det ville vært en tidkrevende prosess, så han stoler heller på at denne teksten er lang nok. Hvis ikke, kan vi alltids legge til flere ord, flere setninger, og kanskje til og med noen ekstra kommaer og punktum for å være helt sikre. Nå nærmer vi oss slutten, og forhåpentligvis har vi nådd målet om over 500 tegn!'
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })

  it('when priority is invalid', () => {
    const messages: MyLinkSmsMessage[] = [
      {
        recipient: '+81548300',
        content: {
          text: 'Hello, this is a test message',
          options: {
            'sms.encoding': MyLinkSmsMessageEncoding.GSM,
            'sms.sender': 'Rumpelo',
            'sms.obfuscate': MyLinkSmsMessageObfuscateOptions.ContentAndRecipient
          }
        },
        priority: 'Test' as MyLinkMessagePriority
      }
    ]

    for (const message of messages) {
      const errors = validator.validate(message)
      // NOTE: This will only validate that there are errors, not the exact number of errors
      assert.ok(Object.keys(errors).length === 1, `Expected validation errors but got: ${JSON.stringify(errors)}`)
    }

    assert.ok(true)
  })
})
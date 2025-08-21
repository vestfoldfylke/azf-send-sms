const { logger } = require('@vtfk/logger')
const sendSms = require('../lib/send-sms')
const validateJson = require('../lib/validate-sms-json')

module.exports = async function (context, request) {
  const data = request.body

  // Verify that input data is present and correct
  const validation = validateJson(data)
  if (validation && validation.errors) {
    const message = 'One or more field has invalid data, please see usage here: https://github.com/vestfoldfylke/azf-send-sms'
    logger('error', ['index', 'send', 'receivers', data.receivers, 'validation-error', JSON.stringify(validation.errors, null, 2)], context)
    context.res = {
      status: 400,
      body: {
        message,
        errors: validation.errors
      }
    }
    return
  }

  try {
    const result = await sendSms(context, data)
    logger('info', ['index', 'send', 'receivers', data.receivers, 'success', JSON.stringify(result.refs)], context)

    context.res = {
      status: 200,
      body: result,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  } catch (error) {
    logger('error', ['index', 'send', 'receivers', data.receivers, 'error', error.message, error.stack], context)

    context.res = {
      status: 500,
      body: 'Something happened! ' + error.message
    }
  }
}

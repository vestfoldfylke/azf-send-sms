const { sendSms } = require('pswincom-gateway')
const { logger } = require('@vtfk/logger')

module.exports = (context, data) => {
  return new Promise((resolve, reject) => {
    const setup = {
      user: process.env.PSWIN_USERNAME,
      password: process.env.PSWIN_PASSWORD,
      sender: data.sender || process.env.DEFAULT_SENDER,
      receivers: data.receivers,
      message: data.message,
      done: handleResult,
      error: handleError
    }

    if (data.operation) {
      setup.operation = parseInt(data.operation, 10)
    }

    function handleResult (result) {
      logger('info', ['send-sms', 'sender', data.sender, 'receivers', data.receivers, 'success'], context)
      resolve(result)
    }

    function handleError (error) {
      logger('error', ['send-sms', 'sender', data.sender, 'receivers', data.receivers, error], context)
      reject(error)
    }

    sendSms(setup)
  })
}

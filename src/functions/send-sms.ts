import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { logger } from '@vtfk/logger'

import { errorHandling } from '../middleware/error-handling.js'
//import { HTTPError } from '../lib/HTTPError.js'

import { SmsMessage } from '../../types/mylink-sms-message'

export async function sendSms(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const smsData = await request.json() as SmsMessage[]
  
  logger('info', ['sendSms function not implemented', JSON.stringify(smsData, null ,2)], context)
  
  return {
    status: 200
  }
}

app.post('sendSms', {
  authLevel: 'function',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, sendSms)
})

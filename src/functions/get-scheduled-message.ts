import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { logger } from '@vtfk/logger'

import { MyLinkScheduledSmsMessageResponse } from '../../types/mylink-scheduled-message-response.js'

import { errorHandling } from '../middleware/error-handling.js'
import { HTTPError } from '../lib/HTTPError.js'
import { GetAsync } from '../lib/mylink-caller.js'

import { config } from '../config.js'

export async function getScheduledMessage(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const messageId: string | null = request.params.messageId
  if (!messageId) {
    throw new HTTPError(400, 'Bad Request: Missing messageId in path parameters')
  }

  const url = `${config.myLink.baseUrl}/schedules/${messageId}`
  logger('info', [`Fetching scheduled message from MyLink API: ${url}`])
    .catch()

  const response = await GetAsync<MyLinkScheduledSmsMessageResponse>(url)

  return {
    status: 200,
    jsonBody: response
  }
}

app.get('getScheduledMessage', {
  authLevel: 'function',
  route: 'scheduled/messages/{messageId}',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, getScheduledMessage)
})

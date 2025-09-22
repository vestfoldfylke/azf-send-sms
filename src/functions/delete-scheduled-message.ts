import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { logger } from '@vtfk/logger'

import { MyLinkScheduledSmsMessageResponse } from '../../types/mylink-scheduled-message-response.js'

import { errorHandling } from '../middleware/error-handling.js'
import { HTTPError } from '../lib/HTTPError.js'
import { GetAsync } from "../lib/mylink-caller";

import { config } from '../config.js'

export async function deleteScheduledMessage(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const messageId: string | null = request.query.get('messageId')
  const tag: string | null = request.query.get('tag')
  if (!messageId && !tag) {
    throw new HTTPError(400, 'Bad Request: Missing messageId or tag in query parameters')
  }

  // TODO: We might need to use only messageId or tag, not both at the same time (Time Will Show)
  const url = `${config.myLink.baseUrl}/schedules?messageId=${messageId}&tag=${tag}`
  logger('info', [`Deleting scheduled message from MyLink API: ${url}`], context)
    .catch()

  const response = await GetAsync<MyLinkScheduledSmsMessageResponse>(url, context)

  return {
    status: 200,
    jsonBody: response
  }
}

app.deleteRequest('deleteScheduledMessage', {
  authLevel: 'function',
  route: 'scheduled/messages',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, deleteScheduledMessage)
})

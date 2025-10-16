import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { logger } from '@vtfk/logger'

import { MyLinkScheduledSmsMessage } from '../../types/mylink-scheduled-sms-message.js'
import { MyLinkScheduledSmsMessagesResponse } from '../../types/mylink-scheduled-sms-messages-response.js'

import { errorHandling } from '../middleware/error-handling.js'
import { GetAsync } from '../lib/mylink-caller.js'

import { config } from '../config.js'

export async function getScheduledMessages(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const url = `${config.myLink.baseUrl}/schedules${request.query.has('size') ? `?size=${request.query.get('size')}` : ''}`
  logger('info', [`Fetching scheduled messages from MyLink API: ${url}`])
    .catch()

  const messages: MyLinkScheduledSmsMessage[] = []
  let response = await GetAsync<MyLinkScheduledSmsMessagesResponse>(url)

  while (response.currentPage < response.pages) {
    messages.push(...response.items)

    const nextPageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${response.currentPage + 1}`
    logger('info', [`Fetching scheduled messages from MyLink API: ${nextPageUrl}`])
      .catch()
    response = await GetAsync<MyLinkScheduledSmsMessagesResponse>(nextPageUrl)
  }

  messages.push(...response.items)
  logger('info', [`Fetched ${messages.length} scheduled messages from MyLink API`])
    .catch()

  return {
    status: 200,
    jsonBody: messages
  }
}

app.get('getScheduledMessages', {
  authLevel: 'function',
  route: 'scheduled/messages',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, getScheduledMessages)
})

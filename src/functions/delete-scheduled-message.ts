import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'

import { MyLinkScheduledSmsMessageResponse } from '../../types/mylink-scheduled-message-response.js'

import { errorHandling } from '../middleware/error-handling.js'
import { GetAsync } from '../lib/mylink-caller.js'
import { HTTPError } from '../lib/HTTPError.js'
import { MetricsPrefix, MetricsResultFailedLabelValue, MetricsResultLabelName, MetricsResultSuccessLabelValue } from '../constants.js'

import { config } from '../config.js'

const MetricsFilePrefix = 'deleteScheduledMessage'

export async function deleteScheduledMessage(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const messageId: string | null = request.query.get('messageId')
  const tag: string | null = request.query.get('tag')
  if (!messageId && !tag) {
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(400, 'Bad Request: Missing messageId or tag in query parameters')
  }

  // TODO: We might need to use only messageId or tag, not both at the same time (Time Will Show)
  const url = `${config.myLink.baseUrl}/schedules?messageId=${messageId}&tag=${tag}`
  logger('info', [`Deleting scheduled message from MyLink API: ${url}`])
    .catch()
  count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultSuccessLabelValue])

  const response = await GetAsync<MyLinkScheduledSmsMessageResponse>(url)

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

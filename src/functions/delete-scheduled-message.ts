import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'

import { errorHandling } from '../middleware/error-handling.js'
import { DeleteAsync } from '../lib/mylink-caller.js'
import { HTTPError } from '../lib/HTTPError.js'
import { MetricsPrefix, MetricsResultFailedLabelValue, MetricsResultLabelName } from '../constants.js'

import { config } from '../config.js'

const MetricsFilePrefix = 'deleteScheduledMessage'

export async function deleteScheduledMessage(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const messageId: string | null = request.query.get('messageId')
  const tag: string | null = request.query.get('tag')

  if (!messageId && !tag) {
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(400, 'Bad Request: Missing messageId or tag in query parameters')
  }

  const url = `${config.myLink.baseUrl}/schedules?${request.query}`
  logger('info', [`Deleting scheduled message from MyLink API: ${url}`])
    .catch()

  await DeleteAsync(url)

  return {
    status: 204
  }
}

app.deleteRequest('deleteScheduledMessage', {
  authLevel: 'function',
  route: 'scheduled/messages',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, deleteScheduledMessage)
})

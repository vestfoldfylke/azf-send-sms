import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'

import { MyLinkScheduledSmsMessage } from '../../types/mylink-scheduled-sms-message.js'

import { errorHandling } from '../middleware/error-handling.js'
import { GetAsync } from '../lib/mylink-caller.js'
import { HTTPError } from '../lib/HTTPError.js'
import { MetricsPrefix, MetricsResultFailedLabelValue, MetricsResultLabelName } from '../constants.js'

import { config } from '../config.js'

const MetricsFilePrefix = 'getScheduledMessage'

export async function getScheduledMessage(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const messageId: string | null = request.params.messageId

  if (!messageId) {
    count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(400, 'Bad Request: Missing messageId in path parameters')
  }

  const url = `${config.myLink.baseUrl}/schedules/${messageId}`
  logger('info', [`Fetching scheduled message from MyLink API: ${url}`])
    .catch()

  const response = await GetAsync<MyLinkScheduledSmsMessage>(url)

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

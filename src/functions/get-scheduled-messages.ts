import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'

import { MyLinkScheduledSmsMessageResponse } from '../../types/mylink-scheduled-message-response.js'

import { errorHandling } from '../middleware/error-handling.js'
import { GetAsync } from '../lib/mylink-caller.js'

import { config } from '../config.js'
import { MetricsPrefix, MetricsResultLabelName, MetricsResultSuccessLabelValue } from '../constants.js'

const MetricsFilePrefix = 'getScheduledMessages'

export async function getScheduledMessages(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  const url = `${config.myLink.baseUrl}/schedules${request.query.size > 0 ? `?${request.query}` : ''}`
  logger('info', [`Fetching scheduled messages from MyLink API: ${url}`])
    .catch()
  count(`${MetricsPrefix}_${MetricsFilePrefix}_called`, `Number of times ${MetricsFilePrefix} endpoint is called`, [MetricsResultLabelName, MetricsResultSuccessLabelValue])

  const response = await GetAsync<MyLinkScheduledSmsMessageResponse[]>(url)

  return {
    status: 200,
    jsonBody: response
  }
}

app.get('getScheduledMessages', {
  authLevel: 'function',
  route: 'scheduled/messages',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => await errorHandling(request, context, getScheduledMessages)
})

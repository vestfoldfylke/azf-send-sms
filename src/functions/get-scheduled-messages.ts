import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'

import { MyLinkScheduledSmsMessageResponse } from '../../types/mylink-scheduled-message-response.js'

import { errorHandling } from '../middleware/error-handling.js'
import { GetAsync } from '../lib/mylink-caller.js'

import { config } from '../config.js'
import { MetricsPrefix, MetricsResultLabelName, MetricsResultSuccessLabelValue } from '../constants.js'

const MetricsFilePrefix = 'getScheduledMessages'

/*const appendUrlQuery = (url: string, key: string, value: string): string => {
  if (url.endsWith('?')) {
    return `${url}${key}=${value}`
  }
  
  return `${url}&${key}=${value}`
}

const getUrlWithQuery = (params: URLSearchParams): string => {
  const sort: string = params.get('sort')
  const page: number = typeof params.get('page') === 'string'
    ? parseInt(params.get('page'))
    : 1
  const size: number = typeof params.get('size') === 'string'
    ? parseInt(params.get('size'))
    : 25
  const tag: string = params.get('tag')
  const start: string = params.get('start')
  const end: string = params.get('end')

  let url = `${config.myLink.baseUrl}/schedules?`
  if (sort !== null) {
    url = appendUrlQuery(url, 'sort', sort)
  }
  url = appendUrlQuery(url, 'page', page.toString())
  url = appendUrlQuery(url, 'size', size.toString())
  if (tag !== null) {
    url = appendUrlQuery(url, 'tag', tag)
  }
  if (start !== null) {
    url = appendUrlQuery(url, 'start', start)
  }
  if (end !== null) {
    url = appendUrlQuery(url, 'end', end)
  }

  return url
}*/

export async function getScheduledMessages(request: HttpRequest, _: InvocationContext): Promise<HttpResponseInit> {
  /*const url = getUrlWithQuery(request.query)*/
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

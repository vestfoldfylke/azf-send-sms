import { logger } from '@vtfk/logger'
import { InvocationContext } from '@azure/functions'
import { count } from '@vestfoldfylke/vestfold-metrics'

import { MetricsPrefix, MetricsResultLabelName, MetricsResultFailedLabelValue, MetricsResultSuccessLabelValue } from '../constants.js'

import { HTTPError } from './HTTPError.js'
import { getMyLinkToken } from './get-mylink-token.js'

const MetricsFilePrefix = 'myLinkCaller'

const getHeaders = async (): Promise<HeadersInit> => {
  const token = await getMyLinkToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export async function GetAsync<T>(url: string, context: InvocationContext): Promise<T> {
  const headers = await getHeaders()
  const response: Response = await fetch(url, {
    method: 'GET',
    headers
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    count(`${MetricsPrefix}_${MetricsFilePrefix}_GetRequest`, 'Number of GET requests to MyLink', [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(response.status, `GET request to '${url}' failed: ${response.statusText}`, errorData)
  }

  const data: T = await response.json()
  logger('info', [`GET request to '${url}' succeeded`])
    .catch()
  count(`${MetricsPrefix}_${MetricsFilePrefix}_GetRequest`, 'Number of GET requests to MyLink', [MetricsResultLabelName, MetricsResultSuccessLabelValue])
  
  return data
}

export async function PostAsync<T>(url: string, body: string, context: InvocationContext): Promise<T> {
  const headers = await getHeaders()
  const response: Response = await fetch(url, {
    method: 'POST',
    headers,
    body
  })

  if (!response.ok) {
    const errorData = await response.json()
    count(`${MetricsPrefix}_${MetricsFilePrefix}_PostRequest`, 'Number of POST requests to MyLink', [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(response.status, `POST request to '${url}' failed: ${response.statusText}`, errorData)
  }

  const data: T = await response.json()
  logger('info', [`POST request to '${url}' succeeded`])
    .catch()
  count(`${MetricsPrefix}_${MetricsFilePrefix}_PostRequest`, 'Number of POST requests to MyLink', [MetricsResultLabelName, MetricsResultSuccessLabelValue])

  return data
}
import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'

import { getMyLinkToken } from './get-mylink-token.js'
import { HTTPError } from './HTTPError.js'
import { MetricsPrefix, MetricsResultLabelName, MetricsResultFailedLabelValue, MetricsResultSuccessLabelValue } from '../constants.js'

const MetricsFilePrefix = 'myLinkCaller'

const getHeaders = async (): Promise<HeadersInit> => {
  const token = await getMyLinkToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export async function DeleteAsync(url: string): Promise<void> {
  const headers = await getHeaders()
  const response: Response = await fetch(url, {
    method: 'DELETE',
    headers
  })

  if (!response.ok) {
    const errorData = await response.json()
    count(`${MetricsPrefix}_${MetricsFilePrefix}_DeleteRequest`, 'Number of DELETE requests to MyLink', [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(response.status, `DELETE request to '${url}' failed: ${response.statusText}`, errorData)
  }

  logger('info', [`DELETE request to '${url}' succeeded`])
    .catch()
  count(`${MetricsPrefix}_${MetricsFilePrefix}_DeleteRequest`, 'Number of DELETE requests to MyLink', [MetricsResultLabelName, MetricsResultSuccessLabelValue])
}

export async function GetAsync<T>(url: string): Promise<T> {
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

export async function PostAsync<T>(url: string, body: string): Promise<T> {
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
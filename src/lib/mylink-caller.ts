import { logger } from '@vtfk/logger'
import { InvocationContext } from '@azure/functions'

import { HTTPError } from './HTTPError.js'

const headers: HeadersInit = {
  'Content-Type': 'application/json',
}

export async function GetAsync<T>(url: string, context: InvocationContext): Promise<T> {
  const response: Response = await fetch(url, {
    method: 'GET',
    headers
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    throw new HTTPError(response.status, `GET request to '${url}' failed: ${response.statusText}`, errorData)
  }

  const data: T = await response.json()
  logger('info', [`GET request to '${url}' succeeded`], context)
    .catch()
  
  return data
}

export async function PostAsync<T>(url: string, body: string, context: InvocationContext): Promise<T> {
  const response: Response = await fetch(url, {
    method: 'POST',
    headers,
    body
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new HTTPError(response.status, `POST request to '${url}' failed: ${response.statusText}`, errorData)
  }

  const data: T = await response.json()
  logger('info', [`POST request to '${url}' succeeded`], context)
    .catch()

  return data
}
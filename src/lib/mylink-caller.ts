import { logger } from '@vtfk/logger'
import { InvocationContext } from '@azure/functions'

import { HTTPError } from './HTTPError.js'

export async function PostAsync<T>(url: string, body: string, context: InvocationContext): Promise<T> {
  const response: Response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
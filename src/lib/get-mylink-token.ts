import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vtfk/logger'
import { LRUCache } from 'lru-cache'

import { MetricsPrefix, MetricsResultLabelName, MetricsResultFailedLabelValue, MetricsResultSuccessLabelValue } from '../constants.js'
import { HTTPError } from './HTTPError.js'

import { config } from '../config.js'

const cache = new LRUCache<string, string>({
  max: 2,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false
})

const cacheKey = 'myLinkToken'
const MetricsFilePrefix = 'getMyLinkToken'

export async function getMyLinkToken(): Promise<string> {
  const cacheEntry: string = cache.get(cacheKey)
  if (cacheEntry) {
    return cacheEntry
  }
  
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }

  const body = {
    grant_type: 'client_credentials',
    client_id: config.myLink.clientId,
    client_secret: config.myLink.clientSecret,
  }

  const response: Response = await fetch(config.myLink.tokenUrl, {
    method: 'POST',
    headers,
    body: new URLSearchParams(body)
  })
  
  if (!response.ok) {
    const errorData = await response.json()
    count(`${MetricsPrefix}_${MetricsFilePrefix}`, 'Number of MyLink tokens retrieved', [MetricsResultLabelName, MetricsResultFailedLabelValue])
    throw new HTTPError(response.status, `Failed to retrieve MyLink token: ${response.statusText}`, errorData)
  }
  
  const token = await response.json() as { access_token: string, expires_in: number, refresh_expires_in: number, token_type: string, not_before_policy: number, scope: string }
  cache.set(cacheKey, token.access_token, { ttl: token.expires_in * 1000 })
  count(`${MetricsPrefix}_${MetricsFilePrefix}`, 'Number of MyLink tokens retrieved', [MetricsResultLabelName, MetricsResultSuccessLabelValue])
  logger('info', [`Fetched new MyLink token. Expires in ${token.expires_in} seconds`])
    .catch()

  return token.access_token
}

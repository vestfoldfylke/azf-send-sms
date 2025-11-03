import { count } from '@vestfoldfylke/vestfold-metrics'
import { logger } from '@vestfoldfylke/loglady'
import { LRUCache } from 'lru-cache'

import { MyLinkTokenResponse } from '../../types/mylink-token-response'

import { MetricsPrefix, MetricsResultLabelName, MetricsResultFailedLabelValue, MetricsResultSuccessLabelValue } from '../constants.js'
import { HTTPError } from './HTTPError.js'

import { config } from '../config.js'

const cache = new LRUCache<string, string>({
  max: 1,
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

  const token: MyLinkTokenResponse = await response.json()
  const expiresInSeconds = token.expires_in - 60 // Subtract 60 seconds to be safe
  cache.set(cacheKey, token.access_token, { ttl: expiresInSeconds * 1000 })

  count(`${MetricsPrefix}_${MetricsFilePrefix}`, 'Number of MyLink tokens retrieved', [MetricsResultLabelName, MetricsResultSuccessLabelValue])
  logger.info('Fetched new MyLink token. Expires in {ExpiresInSeconds} seconds', expiresInSeconds)

  return token.access_token
}

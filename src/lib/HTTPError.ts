import { HttpResponseInit } from '@azure/functions'

export class HTTPError extends Error {
  public status: number
  public body: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public data?: any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(status: number, message: string, data?: any) {
    super(message)

    this.status = status
    this.body = message
    this.data = data
    this.name = 'HTTPError'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getJsonBody(includeData: boolean = false): any {
    try {
      return JSON.parse(this.body)
    } catch {
      const data = this.data && includeData
        ? this.data
        : undefined
      return {
        message: this.body,
        data
      }
    }
  }

  toResponse(includeData: boolean = false): HttpResponseInit {
    return {
      headers: { 'Content-Type': 'application/json' },
      status: this.status,
      jsonBody: this.getJsonBody(includeData)
    }
  }
}

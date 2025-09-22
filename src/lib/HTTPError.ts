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
  private getJsonBody(): any {
    try {
      return JSON.parse(this.body)
    } catch {
      return { message: this.body }
    }
  }

  toResponse(): HttpResponseInit {
    return {
      headers: { 'Content-Type': 'application/json' },
      status: this.status,
      jsonBody: this.getJsonBody()
    }
  }
}

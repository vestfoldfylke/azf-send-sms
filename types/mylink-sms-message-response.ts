export type SmsMessageResponse = {
  requestId: string,
  messages: SmsMessageResponseData[]
}

export type SmsMessageResponseData = {
  messageId: string
  referenceId: string | null
  recipient: string | null
}
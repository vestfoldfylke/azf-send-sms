export type PayloadSmsMessage = {
  receivers: string[]
  message: string
  sender?: string
  referenceId?: string
  scheduledIn?: number
  scheduledAt?: string
}

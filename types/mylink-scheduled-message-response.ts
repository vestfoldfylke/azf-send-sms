/**
 * Represents a scheduled SMS message
 */
export type MyLinkScheduledSmsMessageResponse = {
  /**
   * The unique identifier of the scheduled message (uuid)
   */
  readonly messageId: string
  /**
   * The scheduled date-time in ISO 8601 format (e.g., "2024-12-31T23:59:59Z")
   */
  readonly scheduledAtDate: string
  /**
   * Date-time in ISO 8601 format (e.g., "2024-12-31T23:59:59Z"). What does this do????????
   */
  readonly sendAtDate: string
  readonly tag?: string
  readonly recipient?: string
}
/**
 * Represents a scheduled SMS message
 */
export type MyLinkScheduledSmsMessage = {
  /**
   * The unique identifier of the scheduled message (uuid)
   */
  readonly messageId: string
  /**
   * The identifier of the product associated with the message (uuid)
   */
  readonly productId: string
  /**
   * Recipient of the message as submitted in the corresponding Message
   */
  readonly recipient: string
  /**
   * Date-time when this message was requested in UTC ISO 8601 format (e.g., "2024-12-31T23:59:59Z")
   */
  readonly scheduledAtDate: string
  /**
   * Date-time when this message should be sent / has been sent in UTC ISO 8601 format (e.g., "2024-12-31T23:59:59Z")
   */
  readonly sendAtDate: string
  /**
   * Not used through this API. Can be used to group scheduled messages
   */
  readonly tag: string | null
}
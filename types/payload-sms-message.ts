/**
 * Represents the payload for sending an SMS message
 */
export type PayloadSmsMessage = {
  /**
   * List of receivers. Must be provided in MSISDN format<br />
   * Example: ["+4781549300", "4798765432"]
   */
  readonly receivers: string[]
  /**
   * A single message can be 160 characters (GSM encoding). If message exceeds 160 characters each message part will be split into 153 characters.<br />
   * Maximum length of a message is dependent on the operator you are sending towards. UCS2 encoding: 70/67 characters single/multipart.<br />
   * Minimum length: 1 character.<br />
   * Maximum length: 38862 characters
   */
  readonly message: string
  /**
   * SenderID of the message. Can be numeric (max 15 digits, can start with +) or alphanumeric (max 11 characters). If not provided, the default sender from configuration will be used
   */
  readonly sender?: string
  /**
   * Your own internal reference/transaction ID (<= 500 characters). Not used for anything except as a reference
   */
  readonly referenceId?: string
  /**
   * Time specified in milliseconds of how much we will offset the message in the future. The maximum value is 3 months (7_889_232_000 milliseconds). If both scheduledIn and scheduledAt are provided, scheduledAt will be used
   */
  readonly scheduledIn?: number
  /**
   * Absolute time specified of when this message should be sent. ISO8601 formatted string in UTC. If both scheduledIn and scheduledAt are provided, scheduledAt will be used
   */
  readonly scheduledAt?: string
}

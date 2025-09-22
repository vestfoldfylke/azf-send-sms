/**
 * Represents an SMS message
 */
export type MyLinkSmsMessage = {
  /**
   * Recipient must be provided in MSISDN format. Remember that MSISDN must have a leading (+)<br />
   * Example: +4781549300
   */
  recipient: string
  content: MyLinkSmsMessageContent
  schedule?: MyLinkMessageSchedule
  expiration?: MyLinkMessageExpiration
  callback?: MyLinkMessageCallback
  /**
   * Your own internal reference/transaction ID (<= 500 characters). Not used for anything except as a reference
   */
  referenceId?: string | null
  /**
   * Set priority on your own message. Priority only affects your own queue
   */
  priority?: MyLinkMessagePriority
}

/**
 * Represents the content of an SMS message
 */
export type MyLinkSmsMessageContent = {
  /**
   * A single message can be 160 characters (GSM encoding). If message exceeds 160 characters each message part will be split into 153 characters.<br />
   * Maximum length of a message is dependent on the operator you are sending towards. UCS2 encoding: 70/67 characters single/multipart.<br />
   * Minimum length: 1 character.<br />
   * Maximum length: 38862 characters
   */
  text: string
  options: MyLinkSmsMessageOptions
}

/**
 * Represents options for sending an SMS message
 */
export type MyLinkSmsMessageOptions = {
  'sms.encoding': MyLinkSmsMessageEncoding
  /**
   * SenderID of the message. Can be numeric (max 15 digits, can start with +) or alphanumeric (max 11 characters)
   */
  'sms.sender': string
  /**
   * Obfuscation allows you to anonymize content and recipient or content only after the message is processed. Non-retrievable
   */
  'sms.obfuscate': MyLinkSmsMessageObfuscateOptions
}

/**
 * Represents the encoding of an SMS message
 */
export enum MyLinkSmsMessageEncoding {
  AutoDetect = 'AutoDetect',
  GSM = 'GSM',
  UCS2 = 'UCS2'
}

/**
 * Represents obfuscation options for an SMS message
 */
export enum MyLinkSmsMessageObfuscateOptions {
  ContentAndRecipient = 'ContentAndRecipient',
  Content = 'Content'
}

export type MyLinkMessageSchedule = {
  /**
   * Time specified in milliseconds of how much we will offset the message in the future. The maximum value is 3 months (7_889_232_000 milliseconds), which is also the default
   */
  relative?: number,
  /**
   * Absolute time specified of when this message should be sent. ISO8601 formatted string in UTC
   */
  absolute?: string
  /**
   * A tag for the message schedule. Can be used to group schedules by tag (0 to 100 characters)
   */
  tag?: string | null
}

export type MyLinkMessageExpiration = {
  /**
   * Time specified in milliseconds of how long the message is supposed to live. The maximum value is 48 hours (172800000 milliseconds), which is also the default
   */
  relative?: number
  /**
   * Absolute time specified of when this message should expire. ISO8601 formatted string in UTC
   */
  absolute?: string
}

/**
 * Represents a callback configuration for delivery reports<br /><br />
 * Example for mode Profile:<br />
 * ```json
 * {
 *    "mode": "Profile"
 * }
 * ```<br /><br />
 * Example for mode URL:<br />
 * ```json
 * {
 *    "mode": "URL",
 *    "urls": ["URL"],
 *    "ttl": 0
 * }
 * ```<br /><br />
 * Example for mode Gate:<br />
 * ```json
 * {
 *    "mode": "Gate",
 *    "gateId": "fb8eac56-4311-4f09-94b9-54f4bee0acb6",
 *    "ttl": 0
 * }
 * ```
 */
export type MyLinkMessageCallback = {
  /**
   * Choose how you want to receive your Delivery reports:<br />
   * Profile sends any DLRs towards your default configuration in MyLINK portal<br />
   * URL sends towards a list of urls provided in the request<br />
   * Gate sends towards a referenced configuration from MyLINK portal<br />
   * None (no DLR is sent anywhere).<br /><br />
   * Each mode requires different request parameters, refer to the fields below
   */
  mode?: MyLinkMessageCallbackMode
  /**
   * List of URLs to receive DLRs on. Mandatory when using mode "URL" - not relevant to any other modes
   */
  urls?: string[] | null
  /**
   * The ID of the callback to be used. Can be set up in the Callbacks section of MyLINK portal. Mandatory when using mode "Gate" - not relevant to any other modes
   */
  gateId?: string | null
  /**
   * Time specified in milliseconds of how long the delivery report is supposed to live.<br />
   * Max value: 28800000.<br />
   * Default value: 14400000.<br />
   * Applicable to all callback modes except for "None".
   */
  ttl?: number
}

export enum MyLinkMessageCallbackMode {
  /**
   * Profile sends any DLRs towards your default configuration in MyLINK portal
   */
  Profile = 'Profile',
  /**
   * URL sends towards a list of urls provided in the request
   */
  URL = 'URL',
  /**
   * Gate sends towards a referenced configuration from MyLINK portal
   */
  Gate = 'Gate',
  /**
   * None (no DLR is sent anywhere)
   */
  None = 'None'
}

export enum MyLinkMessagePriority {
  Normal = 'Normal',
  High = 'High',
  Low = 'Low'
}

/**
 * Represent the response from the SMS message API
 */
export type MyLinkSmsMessageResponse = {
  /**
   * Unique id of the request made towards LINK (uuid)
   */
  readonly requestId: string
  readonly messages: MyLinkSmsMessageResponseData[]
}

/**
 * Represents the data for each message in the SMS message response
 */
export type MyLinkSmsMessageResponseData = {
  /**
   * Unique message ID generated as part of processing the request (uuid)
   */
  readonly messageId: string
  /**
   * Your own internal reference/transaction ID. Not used for anything except as a reference
   */
  readonly referenceId: string | null
  /**
   * Recipient of the message as submitted in the corresponding Message
   */
  readonly recipient: string | null
}
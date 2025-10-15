import { MyLinkScheduledSmsMessage } from "./mylink-scheduled-sms-message";

/**
 * Represents a paginated response containing scheduled SMS messages
 */
export type MyLinkScheduledSmsMessagesResponse = {
  /**
   * The current page number in the paginated response
   */
  readonly currentPage: number
  /**
   * The list of scheduled SMS messages on the current page
   */
  readonly items: MyLinkScheduledSmsMessage[]
  /**
   * The total number of pages available
   */
  readonly pages: number
  /**
   * The total number of scheduled SMS messages across all pages
   */
  readonly results: number
  /**
   * The number of results per page
   */
  readonly resultsPerPage: number
}
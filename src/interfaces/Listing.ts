/**
 * Represents a listing of an item for sale.
 */
export interface Listing {
  /**
   * Unique identifier for the listing.
   */
  id: string;

  /**
   * Name or description of the item being listed.
   */
  item: string;

  /**
   * Price of the item.
   */
  price: number;

  /**
   * Owner of the listing.
   */
  owner: string;

  /**
   * Amount of the item available in the listing.
   */
  amount: number;

  /**
   * Timestamps related to the listing.
   */
  times: {
    /**
     * Timestamp of when the listing was created.
     */
    created: number;

    /**
     * Timestamp of the last update to the listing.
     */
    lastUpdated: number;

    /**
     * Optional timestamp of when the listing expired.
     */
    expired?: number;

    /**
     * Optional timestamp of when the item was sold.
     */
    sold?: number;
  };
}
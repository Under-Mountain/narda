/**
 * Represents an account with credits, bio, and timestamps.
 */
export interface Account {
  /**
   * Unique identifier for the account.
   */
  id: string;

  /**
   * Credits information for the account.
   */
  credits: {
    /**
     * Balance of credits.
     */
    balance: number;
  };

  /**
   * Visual representation of the account.
   */
  visual: string;

  /**
   * Optional biography of the account holder.
   */
  bio?: string;

  /**
   * Timestamps related to the account.
   */
  times: {
    /**
     * Optional timestamp of when the account was created.
     */
    created?: number;

    /**
     * Optional timestamp of the last activity on the account.
     */
    lastActive?: number;

    /**
     * Optional timestamp of when the account was last edited.
     */
    edited?: number;
  };
}

/**
 * Represents the type of an activity.
 */
export type ActivityType = 'mint' | 'consume' | 'collect' | 'transaction' | 'system' | 'exchange' | 'stake' | 'withdraw';

/**
 * Represents an activity with details such as type, participants, amount, and timestamps.
 */
export interface Activity {
  /**
   * Type of the activity.
   */
  type: ActivityType;

  /**
   * Unique identifier for the activity.
   */
  id: string;

  /**
   * Entity that the activity is related to.
   */
  of: string;

  /**
   * Origin of the activity.
   */
  from: string;

  /**
   * Destination of the activity.
   */
  to: string;

  /**
   * Amount involved in the activity.
   */
  amount: number;

  /**
   * Note or description of the activity.
   */
  note: string;

  /**
   * Timestamps related to the activity.
   */
  times: {
    /**
     * Timestamp of when the activity was created.
     */
    created: number;

    /**
     * Optional timestamp of when the activity was completed.
     */
    completed?: number;
  };
}

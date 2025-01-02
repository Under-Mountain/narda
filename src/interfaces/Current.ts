/**
 * Represents the current state of resources, activities, effects, and accounts.
 */
export interface Current {
  /**
   * Current time in the system.
   */
  time: number;

  /**
   * Current resources available.
   */
  resources: {
    /**
     * Water resources.
     */
    water: {
      /**
       * Current balance of water.
       */
      balance: number;

      /**
       * Amount of water supplied.
       */
      supplied: number;
    };

    /**
     * Mineral resources.
     */
    mineral: {
      /**
       * Current balance of minerals.
       */
      balance: number;

      /**
       * Amount of minerals supplied.
       */
      supplied: number;
    };

    /**
     * Credits resources.
     */
    credits: {
      /**
       * Current balance of credits.
       */
      balance: number;

      /**
       * Amount of credits supplied.
       */
      supplied: number;
    };
  };

  /**
   * Current activities in the system.
   */
  activities: {
    /**
     * List of pending activities.
     */
    pending: string[];

    /**
     * List of completed activities.
     */
    completed: string[];
  };

  /**
   * Current effects in the system.
   */
  effects: {
    /**
     * List of pending effects.
     */
    pending: string[];

    /**
     * List of completed effects.
     */
    completed: string[];

    /**
     * List of rejected effects.
     */
    rejected: string[];
  };

  /**
   * List of account identifiers.
   */
  accounts: string[];
}
/**
 * Represents the world with intervals, resources, world bank, and items.
 */
export interface World {
  /**
   * Time intervals in the world.
   */
  interval: {
    /**
     * Interval in minutes.
     */
    minute: number;

    /**
     * Interval in hours.
     */
    hour: number;

    /**
     * Interval in days.
     */
    day: number;

    /**
     * Interval in years.
     */
    year: number;
  };

  /**
   * Resources available in the world.
   */
  resources: {
    /**
     * Water resources.
     */
    water: {
      /**
       * Balance of water.
       */
      balance: number;

      /**
       * Total amount of water.
       */
      total: number;

      /**
       * Low rate of water usage or replenishment.
       */
      rateLo: number;

      /**
       * High rate of water usage or replenishment.
       */
      rateHi: number;
    };

    /**
     * Mineral resources.
     */
    mineral: {
      /**
       * Total amount of minerals.
       */
      total: number;

      /**
       * Low rate of mineral usage or replenishment.
       */
      rateLo: number;

      /**
       * High rate of mineral usage or replenishment.
       */
      rateHi: number;
    };
  };

  /**
   * World bank information.
   */
  bank: {
    /**
     * Maximum deficit allowed in the world bank.
     */
    maxDeficit: number;
  };

  /**
   * Items available in the world.
   */
  items: {
    /**
     * Bankstone item details.
     */
    bankstone: {
      /**
       * Low rate of bankstone usage or replenishment.
       */
      rateLo: number;

      /**
       * High rate of bankstone usage or replenishment.
       */
      rateHi: number;

      /**
       * Low capacity of bankstone.
       */
      capLo: number;

      /**
       * High capacity of bankstone.
       */
      capHi: number;
    };
  };
}
/**
 * Represents an asset with visual representation, ownership, type, and properties.
 */
export interface Asset {
  /**
   * Visual representation of the asset.
   */
  visual: any;

  /**
   * Unique identifier for the asset.
   */
  id: string;

  /**
   * Owner of the asset.
   */
  owner: string;

  /**
   * Type of the asset.
   */
  type: string;

  /**
   * Amount of the asset.
   */
  amount: number;

  /**
   * Optional properties of the asset.
   */
  properties?: {
    /**
     * Optional yield of the asset.
     */
    yield?: number;

    /**
     * Optional capacity of the asset.
     */
    cap?: number;

    /**
     * Optional staked amount of the asset.
     */
    staked?: number;
  };
}
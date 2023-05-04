/* eslint-disable no-unused-vars */
/* eslint dot-notation: 0 */

export class MigrationBase {
  /**
   * This is the schema version. Make sure it matches the new version in system.json
   */
  static version;

  version = this.constructor['version'];

  requiresFlush = false;

  /**
   * Update the actor to the latest schema version.
   */
  async updateActor(actor) {}

  /**
   * Update the item to the latest schema version.
   */
  async updateItem(item, actor) {}

  /**
   * Update the user to the latest schema version.
   */
  async updateUser(_userData) {}

  /**
   * Run migrations for this schema version.
   */
  async migrate() {}
}

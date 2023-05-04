/* eslint-disable no-unused-vars, no-await-in-loop */
import {MigrationBase} from './base';

export default class MigrationRunnerBase {
  latestVersion;

  migrations;

  constructor(migrations) {
    this.migrations = migrations.sort((a, b) => a.version - b.version);
    this.latestVersion = Math.max.apply(
      null,
      this.migrations.map(x => x.version)
    );
  }

  needsMigration(currentVersion, latestVersion) {
    return currentVersion < this.latestVersion;
  }

  diffItems(orig, updated) {
    const ret = {
      inserted: [],
      deleted: [],
      updated: [],
    };

    const origItems = new Map();
    for (const item of orig) {
      origItems.set(item._id, item);
    }

    for (const item of updated) {
      if (origItems.has(item._id)) {
        // check to see if anything changed
        const origItem = origItems.get(item._id);

        const origItemJson = JSON.stringify(origItem);
        const itemJson = JSON.stringify(item);

        if (origItemJson !== itemJson) {
          ret.updated.push(item);
        }

        origItems.delete(item._id);
      } else {
        // it's new
        ret.inserted.push(item);
      }
    }

    // since we've been deleting them as we process, the ones remaining need to be deleted
    for (const item of origItems.values()) {
      ret.deleted.push(item._id);
    }

    return ret;
  }

  async getUpdatedItem(item, migrations) {
    const current = duplicate(item);

    for (const migration of migrations) {
      try {
        await migration.updateItem(current, undefined);
      } catch (err) {
        console.error(err);
      }
    }

    return current;
  }

  async getUpdatedActor(actor, migrations) {
    const current = duplicate(actor);

    for (const migration of migrations) {
      try {
        await migration.updateActor(current);
        for (const item of current.items) {
          await migration.updateItem(item);
        }
      } catch (err) {
        console.error(err);
      }
    }

    return current;
  }

  async getUpdatedUser(userData, migrations) {
    const current = duplicate(userData);
    for (const migration of migrations) {
      try {
        await migration.updateUser(current);
      } catch (err) {
        console.error(err);
      }
    }

    return current;
  }
}

/* eslint no-useless-constructor: 0 */
/* eslint no-await-in-loop: 0 */
/* eslint-disable no-unused-vars */

import MigrationRunnerBase from './migrations/migration-runner-base';
import {MigrationBase} from './migrations/base';

export default class MigrationRunner extends MigrationRunnerBase {
  latestVersion;

  migrations;

  constructor(migrations) {
    super(migrations);
    this.migrations = migrations.sort((a, b) => a.version - b.version);
    this.latestVersion = Math.max.apply(
      null,
      this.migrations.map(x => x.version)
    );
  }

  needsMigration() {
    return super.needsMigration(
      game.settings.get('mc3e', 'worldSchemaVersion')
    );
  }

  async migrateCompendium(pack, migrations) {
    try {
      const documentName = pack.documentName;

      // Unlock the pack for editing
      const wasLocked = pack.locked;
      await pack.configure({locked: false});

      // Begin by requesting server-side data model migration and get the
      // migrated content
      //
      await pack.migrate();
      const documents = await pack.getDocuments();

      const promises = [];

      for (const doc of documents) {
        switch (pack.documentName) {
          case 'Actor':
            promises.push(this.migrateWorldActor(doc, migrations));
            break;
          case 'Item':
            promises.push(this.migrateWorldItem(doc, migrations));
            break;
          case 'Scene':
            for (const token of doc.tokens) {
              promises.push(this.migrateSceneToken(doc, token, migrations));
            }
        }
      }

      await Promise.all(promises);

      // Apply the original locked status for the pack
      await pack.configure({locked: wasLocked});
      console.log(
        `Migrated all ${documentName} documents from Compendium ${pack.collection}`
      );
    } catch (error) {
      console.log(error);
    }
  }

  async migrateWorldItem(item, migrations) {
    try {
      const updatedItem = await this.getUpdatedItem(item, migrations);
      const changes = diffObject(item, updatedItem);
      if (!foundry.utils.isEmpty(changes)) {
        await item.update(changes, {enforceTypes: false});
      }
    } catch (err) {
      console.error(err);
    }
  }

  async migrateWorldActor(actor, migrations) {
    try {
      const baseActor = duplicate(actor);
      const updatedActor = await this.getUpdatedActor(baseActor, migrations);

      const baseItems = baseActor.items;
      const updatedItems = updatedActor.items;

      delete baseActor.items;
      delete updatedActor.items;
      if (JSON.stringify(baseActor) !== JSON.stringify(updatedActor)) {
        await actor.update(updatedActor, {enforceTypes: false});
      }

      // we pull out the items here so that the embedded document operations get called
      const itemDiff = this.diffItems(baseItems, updatedItems);
      if (itemDiff.deleted.length > 0) {
        await actor.deleteEmbeddedDocuments('Item', itemDiff.deleted);
      }
      if (itemDiff.inserted.length > 0) {
        await actor.createEmbeddedDocuments('Item', itemDiff.inserted);
      }
      if (itemDiff.updated.length > 0) {
        await actor.updateEmbeddedDocuments('Item', itemDiff.updated);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async migrateUser(user, migrations) {
    const baseUser = duplicate(user);
    const updatedUser = await this.getUpdatedUser(baseUser, migrations);
    try {
      const changes = diffObject(user, updatedUser);
      if (!foundry.utils.isEmpty(changes)) {
        await user.update(changes, {enforceTypes: false});
      }
    } catch (err) {
      console.error(err);
    }
  }

  async migrateSceneToken(scene, tokenData, migrations) {
    try {
      if (tokenData.actorLink || !game.actors.has(tokenData.actorId)) {
        // if the token is linked or has no actor, we don't need to do anything
        return;
      }

      // build up the actor data
      const baseActor = duplicate(game.actors.get(tokenData.actorId));
      const actorData = mergeObject(baseActor, tokenData.actorData, {
        inplace: false,
      });

      const updatedActor = await this.getUpdatedActor(actorData, migrations);
      const changes = diffObject(actorData, updatedActor);
      if (!foundry.utils.isEmpty(changes)) {
        const actorDataChanges = Object.fromEntries(
          Object.entries(changes).map(([k, v]) => [`actorData.${k}`, v])
        );
        const tokenDataId = tokenData.id;
        await scene.updateEmbeddedDocuments(
          'Token',
          [{id: tokenData.id, ...actorDataChanges}],
          {enforceTypes: false}
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async runMigrations(migrations) {
    // eslint-disable-next-line
    let promises = [];

    // Migrate World Actors
    for (const actor of game.actors) {
      promises.push(this.migrateWorldActor(actor, migrations));
    }

    // Migrate World Items
    for (const item of game.items) {
      promises.push(this.migrateWorldItem(item, migrations));
    }

    for (const user of game.users) {
      promises.push(this.migrateUser(user, migrations));
    }

    for (const pack of game.packs) {
      if (pack.metadata.packageType !== 'world') continue;
      if (!['Actor', 'Item', 'Scene'].includes(pack.documentName)) continue;
      promises.push(this.migrateCompendium(pack, migrations));
    }

    // call the free-form migration function. can really do anything
    for (const migration of migrations) {
      promises.push(migration.migrate());
    }

    // the we should wait for the promises to complete before updating the tokens
    // because the unlinked tokens might not need to be updated anymore since they
    // base their data on global actors
    await Promise.all(promises);
    promises = [];

    // Migrate Scene Actors
    for (const scene of game.scenes) {
      for (const token of scene.tokens) {
        promises.push(this.migrateSceneToken(scene, token, migrations));
      }
    }

    await Promise.all(promises);
  }

  async runMigration() {
    const systemVersion = game.system.version;
    const currentVersion = game.settings.get('mc3e', 'worldSchemaVersion');

    ui.notifications.info(
      `Applying Mc3e System Migration to version ${systemVersion}. Please be patient and do not close your game or shut down your server.`
    );

    const migrationsToRun = this.migrations.filter(
      x => currentVersion < x.version
    );

    // We need to break the migration into phases sometimes.
    // for instance, if a migration creates an item, we need to push that to
    // the foundry backend in order to get an id for the item.
    // This way if a later migration depends on the item actually being created,
    // it will work.
    const migrationPhases = [[]];
    for (const migration of migrationsToRun) {
      migrationPhases[migrationPhases.length - 1].push(migration);
      if (migration.requiresFlush) {
        migrationPhases.push([]);
      }
    }

    for (const migrationPhase of migrationPhases) {
      if (migrationPhase.length > 0) {
        await this.runMigrations(migrationPhase);
      }
    }

    game.settings.set('mc3e', 'worldSchemaVersion', this.latestVersion);
    ui.notifications.info(
      `MC3E System Migration to version ${systemVersion} completed!`
    );
  }
}

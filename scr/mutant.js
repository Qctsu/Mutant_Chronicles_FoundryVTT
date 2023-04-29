/* eslint-disable no-shadow, no-unused-vars */

import {CONFIG as CONANCONFIG} from './scripts/config';
import Conan2d20Macros from './module/system/macro';
import ActorConan2d20 from './module/actor/actor';
import CombatDie from './module/system/dice';
import Conan2d20Item from './module/item/item';
import Counter from './module/system/counter';
import FoundryOverrides from './module/system/overrides';
import ItemConan2d20 from './module/item/item';
import loadTemplates from './module/templates';
import MigrationRunner from './module/migration-runner';
import Migrations from './module/migrations';
import registerActors from './module/register-actors';
import registerHandlebarsHelpers from './module/handlebars';
import registerSettings from './module/settings';
import registerSheets from './module/register-sheets';
import SoakForm from './module/system/soak';

require('./styles/conan2d20.scss');

Hooks.once('init', () => {
  console.log("Conan2d20 | Initializing Robert E. Howard's Conan 2D20 System");

  CONFIG.CONAN = CONANCONFIG;

  for (const k in CONFIG.CONAN) {
    if (Object.prototype.hasOwnProperty.call(CONFIG.CONAN, k)) {
      CONFIG[k] = CONFIG.CONAN[k];
    }
  }

  CONFIG.Item.documentClass = ItemConan2d20;
  CONFIG.Actor.documentClass = ActorConan2d20;
  CONFIG.CONAN.Counter = new Counter();
  CONFIG.CONAN.Dice = {CombatDie};

  registerSettings();
  loadTemplates();
  registerActors();
  registerSheets();
  registerHandlebarsHelpers();

  game.conan2d20 = {
    config: CONANCONFIG,
    macros: Conan2d20Macros,
  };
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */
/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once('setup', () => {
  for (const obj in game.conan2d20.config) {
    if ({}.hasOwnProperty.call(game.conan2d20.config, obj)) {
      for (const el in game.conan2d20.config[obj]) {
        if ({}.hasOwnProperty.call(game.conan2d20.config[obj], el)) {
          if (typeof game.conan2d20.config[obj][el] === 'string') {
            game.conan2d20.config[obj][el] = game.i18n.localize(
              game.conan2d20.config[obj][el]
            );
          }
        }
      }
    }
  }
});

Hooks.on('ready', () => {
  /**
    Once the entire VTT framework is initialized, check to see if we should
    perform a data migration
  */
  console.log(
    'Conan2d20 System | Readying Robert E. Howards Conan 2D20 System'
  );

  // Determine whether a system migration is required and feasible
  const currentVersion = game.settings.get('conan2d20', 'worldSchemaVersion');
  const COMPATIBLE_MIGRATION_VERSION = 0.031421;

  if (game.user.isGM) {
    // Perform the migration
    const migrationRunner = new MigrationRunner(Migrations.constructAll());
    if (migrationRunner.needsMigration()) {
      if (currentVersion && currentVersion < COMPATIBLE_MIGRATION_VERSION) {
        ui.notifications.error(
          `Your Conan2d20 system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`
        );
      }
      migrationRunner.runMigration();
    }
  }

  CONFIG.CONAN.Counter.render(true);

  CONFIG.Dice.terms.p = CombatDie;

  FoundryOverrides();

  game.socket.on('system.conan2d20', event => {
    if (event.type === 'setCounter' && game.user.isGM) {
      Counter.setCounter(event.payload.value, event.payload.type);
    }

    if (event.type === 'updateCounter') {
      CONFIG.CONAN.Counter.render(true);
    }
  });

  Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (data.type === 'Item') {
      game.conan2d20.macros.createItemMacro(data, slot);
      return false;
    }
  });
});

// On rendering a chat message, if it contains item data (from a posted item), make draggable with the data transfer set to that item data.
Hooks.on('renderChatMessage', (msg, html, data) => {
  if (hasProperty(data, 'message.flags.conan2d20.itemData')) {
    html[0].addEventListener('dragstart', ev => {
      ev.dataTransfer.setData(
        'text/plain',
        JSON.stringify({
          type: 'item-drag',
          payload: data.message.flags.conan2d20.itemData,
        })
      );
    });
  }
  if (getProperty(msg, 'flags.conan2d20.effects')) {
    html
      .find('h4.dice-total')
      .append(
        ` (${msg.data.flags.conan2d20.effects} <img class="effect-total" src='systems/conan2d20/assets/dice/phoenix/phoenix-black.png'>)`
      );
  }
});

/**
 * Adds the cover/soak roll button to tiles and drawings
 */
Hooks.on('renderBasePlaceableHUD', (hud, html) => {
  if (hud.object instanceof Drawing || hud.object instanceof Tile) {
    const button = $(
      '<div class=\'control-icon\'><img src="systems/conan2d20/assets/dice/phoenix/phoenix-white.png" width="36" height="36"></div>'
    );
    button.attr(
      'title',
      'Left Click to roll Morale and Soak\nRight Click to configure Morale or Cover'
    );
    button.mousedown(event => {
      if (event.button === 0) {
        const moraleRoll =
          CONFIG.CONAN.soakDice[
            getProperty(hud.object, 'data.flags.conan2d20.soak.morale')
          ];
        const coverRoll =
          CONFIG.CONAN.soakDice[
            getProperty(hud.object, 'data.flags.conan2d20.soak.cover')
          ];

        if (moraleRoll)
          new Roll(moraleRoll)
            .roll()
            .toMessage({flavor: game.i18n.localize('CONAN.soakMorale')});
        if (coverRoll)
          new Roll(coverRoll)
            .roll()
            .toMessage({flavor: game.i18n.localize('CONAN.soakCover')});

        if (!moraleRoll && !coverRoll)
          ui.notifications.warn('No area soak. Right click to configure.');
      } else if (event.button === 2) {
        new SoakForm(hud.object).render(true);
      }
    });
    html.find('.col.right').append(button);
  }
});

// Hooks.on('updateCombat', (...args) => {
//   console.log('test');
// });

Hooks.once('diceSoNiceReady', dice3d => {
  dice3d.addSystem(
    {id: 'conan2d20black', name: 'Conan 2d20 - Black'},
    'default'
  );
  dice3d.addSystem({id: 'conan2d20white', name: 'Conan 2d20 - White'}, false);

  dice3d.addDicePreset({
    type: 'd20',
    labels: [
      'systems/conan2d20/assets/dice/phoenix/phoenix-black.png',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
    ],
    /* eslint-disable-next-line no-sparse-arrays */
    bumpMaps: [
      'systems/conan2d20/assets/dice/phoenix/phoenixBump.png',
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
    ],
    system: 'conan2d20black',
  });

  dice3d.addDicePreset({
    type: 'd20',
    labels: [
      'systems/conan2d20/assets/dice/phoenix/phoenix-white.png',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
    ],
    /* eslint-disable-next-line no-sparse-arrays */
    bumpMaps: [
      'systems/conan2d20/assets/dice/phoenix/phoenixBump.png',
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
    ],
    system: 'conan2d20white',
  });

  dice3d.addDicePreset({
    type: 'dp',
    labels: [
      'systems/conan2d20/assets/dice/combat/black/Combat1.png',
      'systems/conan2d20/assets/dice/combat/black/Combat2.png',
      'systems/conan2d20/assets/dice/combat/black/Combat3.png',
      'systems/conan2d20/assets/dice/combat/black/Combat4.png',
      'systems/conan2d20/assets/dice/combat/black/Combat5.png',
      'systems/conan2d20/assets/dice/combat/black/Combat6.png',
    ],
    bumpMaps: [
      'systems/conan2d20/assets/dice/combat/black/Combat1.png',
      'systems/conan2d20/assets/dice/combat/black/Combat2.png',
      'systems/conan2d20/assets/dice/combat/black/Combat3.png',
      'systems/conan2d20/assets/dice/combat/black/Combat4.png',
      'systems/conan2d20/assets/dice/combat/black/Combat5.png',
      'systems/conan2d20/assets/dice/combat/black/Combat6.png',
    ],
    system: 'conan2d20black',
  });

  dice3d.addDicePreset({
    type: 'dp',
    labels: [
      'systems/conan2d20/assets/dice/combat/white/Combat1.png',
      'systems/conan2d20/assets/dice/combat/white/Combat2.png',
      'systems/conan2d20/assets/dice/combat/white/Combat3.png',
      'systems/conan2d20/assets/dice/combat/white/Combat4.png',
      'systems/conan2d20/assets/dice/combat/white/Combat5.png',
      'systems/conan2d20/assets/dice/combat/white/Combat6.png',
    ],
    bumpMaps: [
      'systems/conan2d20/assets/dice/combat/white/Combat1.png',
      'systems/conan2d20/assets/dice/combat/white/Combat2.png',
      'systems/conan2d20/assets/dice/combat/white/Combat3.png',
      'systems/conan2d20/assets/dice/combat/white/Combat4.png',
      'systems/conan2d20/assets/dice/combat/white/Combat5.png',
      'systems/conan2d20/assets/dice/combat/white/Combat6.png',
    ],
    system: 'conan2d20white',
  });
});

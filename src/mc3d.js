/* eslint-disable no-shadow, no-unused-vars */

import {CONFIG as MUTANTCONFIG} from './scripts/config';
import Mc3eMacros from './module/system/macro';
import ActorMc3e from './module/actor/actor';
import CombatDie from './module/system/dice';
import Mc3eItem from './module/item/item';
import Counter from './module/system/counter';
import FoundryOverrides from './module/system/overrides';
import ItemMc3e from './module/item/item';
import loadTemplates from './module/templates';
import MigrationRunner from './module/migration-runner';
import Migrations from './module/migrations';
import registerActors from './module/register-actors';
import registerHandlebarsHelpers from './module/handlebars';
import registerSettings from './module/settings';
import registerSheets from './module/register-sheets';
import SoakForm from './module/system/soak';

require('./styles/mc3e.scss');

Hooks.once('init', () => {
  console.log("Mc3e | Initializing Mutant Chronicles (3rd Edition) System");

  CONFIG.MUTANT = MUTANTCONFIG;

  for (const k in CONFIG.MUTANT) {
    if (Object.prototype.hasOwnProperty.call(CONFIG.MUTANT, k)) {
      CONFIG[k] = CONFIG.MUTANT[k];
    }
  }

  CONFIG.Item.documentClass = ItemMc3e;
  CONFIG.Actor.documentClass = ActorMc3e;
  CONFIG.MUTANT.Counter = new Counter();
  CONFIG.MUTANT.Dice = {CombatDie};

  registerSettings();
  loadTemplates();
  registerActors();
  registerSheets();
  registerHandlebarsHelpers();

  game.mc3e = {
    config: MUTANTCONFIG,
    macros: Mc3eMacros,
  };
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */
/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once('setup', () => {
  for (const obj in game.mc3e.config) {
    if ({}.hasOwnProperty.call(game.mc3e.config, obj)) {
      for (const el in game.mc3e.config[obj]) {
        if ({}.hasOwnProperty.call(game.mc3e.config[obj], el)) {
          if (typeof game.mc3e.config[obj][el] === 'string') {
            game.mc3e.config[obj][el] = game.i18n.localize(
              game.mc3e.config[obj][el]
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
    'Mc3e System | Readying Robert E. Howards Mutant 2D20 System'
  );

  // Determine whether a system migration is required and feasible
  const currentVersion = game.settings.get('mc3e', 'worldSchemaVersion');
  const COMPATIBLE_MIGRATION_VERSION = 0.031421;

  if (game.user.isGM) {
    // Perform the migration
    const migrationRunner = new MigrationRunner(Migrations.constructAll());
    if (migrationRunner.needsMigration()) {
      if (currentVersion && currentVersion < COMPATIBLE_MIGRATION_VERSION) {
        ui.notifications.error(
          `Your Mc3e system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`
        );
      }
      migrationRunner.runMigration();
    }
  }

  CONFIG.MUTANT.Counter.render(true);

  CONFIG.Dice.terms.p = CombatDie;

  FoundryOverrides();

  game.socket.on('system.mc3e', event => {
    if (event.type === 'setCounter' && game.user.isGM) {
      Counter.setCounter(event.payload.value, event.payload.type);
    }

    if (event.type === 'updateCounter') {
      CONFIG.MUTANT.Counter.render(true);
    }
  });

  Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (data.type === 'Item') {
      game.mc3e.macros.createItemMacro(data, slot);
      return false;
    }
  });
});

// On rendering a chat message, if it contains item data (from a posted item), make draggable with the data transfer set to that item data.
Hooks.on('renderChatMessage', (msg, html, data) => {
  if (hasProperty(data, 'message.flags.mc3e.itemData')) {
    html[0].addEventListener('dragstart', ev => {
      ev.dataTransfer.setData(
        'text/plain',
        JSON.stringify({
          type: 'item-drag',
          payload: data.message.flags.mc3e.itemData,
        })
      );
    });
  }
  if (getProperty(msg, 'flags.mc3e.effects')) {
    html
      .find('h4.dice-total')
      .append(
        ` (${msg.data.flags.mc3e.effects} <img class="effect-total" src='systems/mc3e/assets/dice/phoenix/phoenix-black.png'>)`
      );
  }
});

/**
 * Adds the cover/soak roll button to tiles and drawings
 */
Hooks.on('renderBasePlaceableHUD', (hud, html) => {
  if (hud.object instanceof Drawing || hud.object instanceof Tile) {
    const button = $(
      '<div class=\'control-icon\'><img src="systems/mc3e/assets/dice/phoenix/phoenix-white.png" width="36" height="36"></div>'
    );
    button.attr(
      'title',
      'Left Click to roll Morale and Soak\nRight Click to configure Morale or Cover'
    );
    button.mousedown(event => {
      if (event.button === 0) {
        const moraleRoll =
          CONFIG.MUTANT.soakDice[
            getProperty(hud.object, 'data.flags.mc3e.soak.morale')
          ];
        const coverRoll =
          CONFIG.MUTANT.soakDice[
            getProperty(hud.object, 'data.flags.mc3e.soak.cover')
          ];

        if (moraleRoll)
          new Roll(moraleRoll)
            .roll()
            .toMessage({flavor: game.i18n.localize('MUTANT.soakMorale')});
        if (coverRoll)
          new Roll(coverRoll)
            .roll()
            .toMessage({flavor: game.i18n.localize('MUTANT.soakCover')});

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
    {id: 'mc3eblack', name: 'Mutant 2d20 - Black'},
    'default'
  );
  dice3d.addSystem({id: 'mc3ewhite', name: 'Mutant 2d20 - White'}, false);

  dice3d.addDicePreset({
    type: 'd20',
    labels: [
      'systems/mc3e/assets/dice/phoenix/phoenix-black.png',
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
      'systems/mc3e/assets/dice/phoenix/phoenixBump.png',
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
    system: 'mc3eblack',
  });

  dice3d.addDicePreset({
    type: 'd20',
    labels: [
      'systems/mc3e/assets/dice/phoenix/phoenix-white.png',
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
      'systems/mc3e/assets/dice/phoenix/phoenixBump.png',
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
    system: 'mc3ewhite',
  });

  dice3d.addDicePreset({
    type: 'dp',
    labels: [
      'systems/mc3e/assets/dice/combat/black/Combat1.png',
      'systems/mc3e/assets/dice/combat/black/Combat2.png',
      'systems/mc3e/assets/dice/combat/black/Combat3.png',
      'systems/mc3e/assets/dice/combat/black/Combat4.png',
      'systems/mc3e/assets/dice/combat/black/Combat5.png',
      'systems/mc3e/assets/dice/combat/black/Combat6.png',
    ],
    bumpMaps: [
      'systems/mc3e/assets/dice/combat/black/Combat1.png',
      'systems/mc3e/assets/dice/combat/black/Combat2.png',
      'systems/mc3e/assets/dice/combat/black/Combat3.png',
      'systems/mc3e/assets/dice/combat/black/Combat4.png',
      'systems/mc3e/assets/dice/combat/black/Combat5.png',
      'systems/mc3e/assets/dice/combat/black/Combat6.png',
    ],
    system: 'mc3eblack',
  });

  dice3d.addDicePreset({
    type: 'dp',
    labels: [
      'systems/mc3e/assets/dice/combat/white/Combat1.png',
      'systems/mc3e/assets/dice/combat/white/Combat2.png',
      'systems/mc3e/assets/dice/combat/white/Combat3.png',
      'systems/mc3e/assets/dice/combat/white/Combat4.png',
      'systems/mc3e/assets/dice/combat/white/Combat5.png',
      'systems/mc3e/assets/dice/combat/white/Combat6.png',
    ],
    bumpMaps: [
      'systems/mc3e/assets/dice/combat/white/Combat1.png',
      'systems/mc3e/assets/dice/combat/white/Combat2.png',
      'systems/mc3e/assets/dice/combat/white/Combat3.png',
      'systems/mc3e/assets/dice/combat/white/Combat4.png',
      'systems/mc3e/assets/dice/combat/white/Combat5.png',
      'systems/mc3e/assets/dice/combat/white/Combat6.png',
    ],
    system: 'mc3ewhite',
  });
});

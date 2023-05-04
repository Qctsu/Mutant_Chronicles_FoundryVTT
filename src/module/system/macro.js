import Counter from './counter';
import CombatDiceRoller from '../apps/combat-dice-roller';
import SkillRoller from '../apps/skill-roller';
import DamageRoller from '../apps/damage-roller';
import SoakDiceRoller from '../apps/soak-dice-roller';

export default class Mc3eMacros {
  static async basicSkillRoll() {
    return new SkillRoller().render(true);
  }

  static async combatDiceRoll() {
    new CombatDiceRoller().render(true);
  }

  static async coverSoakDiceRoll(itemName = null, soak = 1) {
    return Mc3eMacros.soakDiceRoll('cover', itemName, soak);
  }

  static async createItemMacro(dropData, slot) {
    const itemData = await Item.implementation.fromDropData(dropData);

    if (!itemData) {
      return ui.notifications.warn(
        game.i18n.localize('MUTANT.Macro.Warn.CreateItemRequiresOwnership')
      );
    }

    const macroData = {
      command: `game.mc3e.macros.postItem("${dropData.uuid}")`,
      flags: {'mc3e.itemMacro': true},
      img: itemData.img,
      name: itemData.name,
      scope: 'actor',
      type: 'script',
    };

    // Assign the macro to the hotbar
    const macro =
      game.macros.find(
        m =>
          m.name === macroData.name &&
          m.command === macroData.command &&
          m.author.isSelf
      ) || (await Macro.create(macroData));

    game.user.assignHotbarMacro(macro, slot);
  }

  static async damageRoll(weaponName = null) {
    const actor = await Mc3eMacros._getMacroActor();

    let item = null;
    if (weaponName) {
      if (actor) {
        item = actor.getItemByName(weaponName);
      } else if (game.user.isGM) {
        item = game.items.find(x => x.name === weaponName) || null;
      }

      if (!item) {
        return ui.notifications.error(
          game.i18n.format('MUTANT.Macro.Error.NoSuchItem', {
            itemName: weaponName,
          })
        );
      }

      if (!item.canCauseDamage()) {
        return ui.notifications.error(
          game.i18n.format('MUTANT.Macro.Error.ItemCannotCauseDamage', {
            itemName: weaponName,
          })
        );
      }
    }

    const options = {item};

    return new DamageRoller(actor, options).render(true);
  }

  static async initGame() {
    if (!game.user.isGM) {
      return ui.notifications.error(
        game.i18n.format('MUTANT.Macro.Error.GameMasterRoleRequired', {
          macro: 'Initialize Game',
        })
      );
    } else {
      try {
        const players = game.users.players;

        let startingDoom = 0;

        for (const player of players) {
          const actor = player.character;

          if (!actor) continue; // Player doesn't own a character

          // Reset current Vigor and Resolve to max.
          actor.update({'system.health.mental.value': actor.getMaxResolve()});
          actor.update({'system.health.physical.value': actor.getMaxVigor()});

          // Reset Fortune
          const startingFortune = actor.system.resources.fortune.max;
          actor.update({'system.resources.fortune.value': startingFortune});

          startingDoom += startingFortune;

          // Also purge any leftover personal momentum
          actor.update({'system.momentum': 0});
        }

        // Momentum is reset to zero
        Counter.setCounter(0, 'momentum');

        // Set Doom to starting value (sum of all players' starting Fortune)
        Counter.setCounter(startingDoom, 'doom');

        return ui.notifications.info(
          game.i18n.format('MUTANT.Macro.Success', {
            macro: 'Initialize Game',
          })
        );
      } catch (e) {
        return ui.notifications.error(
          game.i18n.format('MUTANT.Macro.Error.CaughtError', {
            macro: 'Initialize Game',
            error: e,
          })
        );
      }
    }
  }

  static async moraleSoakDiceRoll(itemName = null, soak = 1) {
    return Mc3eMacros.soakDiceRoll('morale', itemName, soak);
  }

  static async newScene() {
    if (!game.user.isGM) {
      return ui.notifications.error(
        game.i18n.format('MUTANT.Macro.Error.GameMasterRoleRequired', {
          macro: 'New Scene',
        })
      );
    } else {
      try {
        const players = game.users.players;

        for (const player of players) {
          const actor = player.character;

          if (!actor) continue; // Player doesn't own a character

          // Reset current Vigor and Resolve to max.
          actor.update({'system.health.mental.value': actor.getMaxResolve()});
          actor.update({'system.health.physical.value': actor.getMaxVigor()});

          // Also purge any leftover personal momentum
          actor.update({'system.momentum': 0});
        }

        // Now reduce the momentum pool by one
        Counter.changeCounter(-1, 'momentum');

        return ui.notifications.info(
          game.i18n.format('MUTANT.Macro.Success', {
            macro: 'New Scene',
          })
        );
      } catch (e) {
        return ui.notifications.error(
          game.i18n.format('MUTANT.Macro.Error.CaughtError', {
            macro: 'New Scene',
            error: e,
          })
        );
      }
    }
  }

  static async postItem(itemUuid) {
    // This is very basic for now, we just post any item to chat
    const item = await fromUuid(itemUuid);
    item.postItem();
  }

  static async skillRoll(skillName = null) {
    const actor = await Mc3eMacros._getMacroActor();

    if (!actor) return new SkillRoller().render(true);

    const options = {};

    // If a skill name has been specified, try and match it up to those the
    // system supports and work out what Attribute it uses by default.
    //
    if (skillName) {
      skillName ||= '';
      skillName = skillName.toLowerCase();

      if (actor.type === 'npc') {
        for (let expertise in CONFIG.MUTANT.expertiseFields) {
          if (
            CONFIG.MUTANT.expertiseFields[expertise].toLowerCase() === skillName
          ) {
            options.expertise = expertise;
            options.attribute = CONFIG.MUTANT.expertiseAttributeMap[expertise];
            break;
          }
        }
      } else {
        for (let skill in CONFIG.MUTANT.skills) {
          if (CONFIG.MUTANT.skills[skill].toLowerCase() === skillName) {
            options.skill = skill;
            options.attribute = CONFIG.MUTANT.skillAttributeMap[skill];
            break;
          }
        }
      }

      if (!(options.attribute && (options.expertise || options.skill))) {
        return ui.notifications.warn(
          game.i18n.format('MUTANT.Macro.Error.UnknownSkill', {
            skillName,
            actorName: actor.name,
          })
        );
      }
    }

    if (actor) {
      return new SkillRoller(actor, options).render(true);
    }
  }

  static async soakDiceRoll(type = 'cover', itemName = null, soak = 1) {
    const actor = await Mc3eMacros._getMacroActor();
    const options = {type, itemName, soak};
    new SoakDiceRoller(actor, options).render(true);
  }

  // Work out which actor to use.  If the user running the macro is the GM and
  // they have no tokens selected then create a generic version, otherwise use
  // the selected token.
  //
  // Players running a script always use their own character Actor.
  //
  static async _getMacroActor() {
    let actor = null;

    if (game.user.isGM) {
      const controlledTokenCount = canvas.tokens.controlled.length;
      if (controlledTokenCount > 0) {
        if (controlledTokenCount !== 1) {
          return ui.notifications.warn(
            game.i18n.format('MUTANT.Macro.Error.TooManyTokensSelected', {
              max: 1,
            })
          );
        } else {
          actor = canvas.tokens.controlled[0].actor;
        }
      }
    } else {
      actor = game.user.character;
    }

    return actor;
  }
}

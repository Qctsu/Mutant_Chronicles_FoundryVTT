import MutantChat from './chat';

export default class Mc3eDice {
  static async calculateCombatDiceRoll(rollData) {
    // rollData = {
    //   base: {
    //     numDice: 1,
    //   },
    //   bonus: {
    //     attribute: 0,
    //   },
    //   damage: {
    //     location: null,
    //     type: null,
    //   },
    //   spends: {
    //     doom: 0,
    //     momentum: 0,
    //   },
    //   actorId: null,
    //   fixedResults: [],
    //   isReroll: false,
    //   itemId: null,
    //   numDice: 1,
    //   title: 'Combat Dice Roll',
    // }

    const results = {
      total: 0,
      effects: 0,
      location: null,
      rolls: [],
    };

    // Total number to roll doesn't include any fixed results from a reroll
    const numDice = rollData.numDice - rollData.fixedResults.length;

    const rollInstance = new Roll(`${numDice}dp`);
    let combatDiceRolls = await rollInstance.roll({async: true});

    if (game.dice3d) {
      await Mc3eDice.showDiceSoNice(
        rollInstance,
        game.settings.get('core', 'rollMode')
      );
    }

    results.rolls = combatDiceRolls.terms[0].results;

    // Populate each roll with its display value and a null index which will
    // be set correctly after any reroll merges have occured.
    //
    results.rolls.forEach((roll, index) => {
      roll.index = null;
      roll.display = combatDiceRolls.terms[0].resultValues[index];
    });

    // If we're performing a reroll, then merge the rerolled dice into the
    // correct slots in the original results which makes it more obvious how
    // the new roll performed rather than shifting the position of all results
    //
    if (rollData.isReroll) {
      results.rolls = await this._mergeRerolls(
        results.rolls,
        rollData.fixedResults
      );
    }

    // Go through all rolls and index their placement for future use.
    //
    results.rolls.forEach((roll, index) => {
      roll.index = index;
      results.effects += roll.effect ? 1 : 0;
      results.total += roll.result <= 2 ? roll.result : 0;
    });

    // Add momentum/doom spend damage at a 1-for-1 level
    //
    // NOTE: PCs cannot use Doom to increase damage, but this is taken into
    // account by the Roller interface
    results.total += rollData.spends.doom + rollData.spends.momentum;

    // Only add additional effect damage if not an improvised attack
    //
    if (!rollData.improvised) {
      results.total += results.effects;
    }

    // Get a hit location if this isn't a reroll, otherwise used the previous
    // hit location value
    //
    let hitLocation = rollData.damage.location;
    if (!hitLocation && rollData.damage.type !== 'mental') {
      let locationRoll = await new Roll('1d20').roll({async: true});
      const newLocation = parseInt(locationRoll.result);

      if (newLocation >= 1 && newLocation <= 2) {
        rollData.damage.location = CONFIG.coverageTypes.head;
      } else if (newLocation >= 3 && newLocation <= 5) {
        rollData.damage.location = CONFIG.coverageTypes.rarm;
      } else if (newLocation >= 6 && newLocation <= 8) {
        rollData.damage.location = CONFIG.coverageTypes.larm;
      } else if (newLocation >= 9 && newLocation <= 14) {
        rollData.damage.location = CONFIG.coverageTypes.torso;
      } else if (newLocation >= 15 && newLocation <= 17) {
        rollData.damage.location = CONFIG.coverageTypes.rleg;
      } else {
        rollData.damage.location = CONFIG.coverageTypes.lleg;
      }
    }

    results.location = rollData.damage.location;

    return results;
  }

  static async calculateSkillRoll(rollData) {
    // rollData = {
    //   actor: null,
    //   assists: {
    //     complication: 20,
    //     focus: 0,
    //     numDice: 0,
    //     tn: 7,
    //   },
    //   bonus: {
    //     dice: 0,
    //     momentum: 0,
    //     successes: 0,
    //   },
    //   difficulty: {
    //     base: 1,
    //     display: '&nbsp;',
    //     increase: 0,
    //   },
    //   skill: {
    //     complication: 20,
    //     display: '&nbsp;',
    //     expertise: 0,
    //     focus: 0,
    //     tn: 7,
    //   },
    //   spends: {
    //     doom: 0,
    //     fortune: 0,
    //     momentum: 0,
    //   },
    //   fixedResults: [],
    //   title: 'Skill Test',
    //   isAssist: false,
    //   isReroll: false,
    //   item: null,
    //   numDice: CONFIG.BASE_2D20_DICE,
    // };

    const results = {
      successes: 0,
      crits: 0,
      momentum: 0,
      complications: 0,
      rolls: [],
    };

    let skillDiceToRoll;
    if (rollData.isReroll) {
      skillDiceToRoll =
        rollData.numDice +
        rollData.assists.numDice -
        rollData.fixedResults.length;
    } else {
      skillDiceToRoll = rollData.numDice - rollData.spends.fortune;
    }

    skillDiceToRoll = skillDiceToRoll >= 0 ? skillDiceToRoll : 0;

    let skillRollInstance = new Roll(
      `${skillDiceToRoll}d20cs<=${rollData.skill.tn}cf>=${rollData.skill.complication}`
    );

    let skillRolls = await skillRollInstance.roll({async: true});

    if (game.dice3d) {
      await Mc3eDice.showDiceSoNice(
        skillRollInstance,
        game.settings.get('core', 'rollMode')
      );
    }

    if (!rollData.isReroll) {
      // Hard code the requested fortune dice as successes
      //
      for (let i = 0; i < rollData.spends.fortune; i++) {
        let critical = rollData.skill.focus > 0 ? true : false;

        results.rolls.unshift({
          assist: false,
          complication: false,
          critical,
          result: 1,
          success: true,
          fortuneSpend: true,
        });
      }
    }

    skillRolls.terms[0].results.forEach(roll => {
      results.rolls.push({
        assist: false,
        complication: roll.failure || false,
        critical: roll.result <= rollData.skill.focus,
        result: roll.result,
        success: roll.success || false,
      });
    });

    // Roll assists seperately, as it's possible that there are different TN and
    // expertise values required for the test
    //
    if (rollData.assists.numDice > 0 && !rollData.isReroll) {
      let assistSkillDiceToRoll = rollData.assists.numDice;

      let assistRollInstance = new Roll(
        `${assistSkillDiceToRoll}d20cs<=${rollData.assists.tn}cf>=${rollData.assists.complication}`
      );
      let assistRolls = await assistRollInstance.roll({async: true});

      if (game.dice3d) {
        await Mc3eDice.showDiceSoNice(
          assistRollInstance,
          game.settings.get('core', 'rollMode')
        );
      }

      assistRolls.terms[0].results.forEach(roll => {
        results.rolls.push({
          assist: true,
          complication: roll.failure || false,
          critical: roll.result <= rollData.assists.focus,
          result: roll.result,
          success: roll.success || false,
          fortuneSpend: false,
        });
      });
    }

    // If we're performing a reroll, then merge the rerolled dice into the
    // correct slots in the original results which makes it more obvious how
    // the new roll performed rather than shifting the position of all results
    //
    if (rollData.isReroll) {
      results.rolls = await this._mergeRerolls(
        results.rolls,
        rollData.fixedResults
      );
    }

    // Go through all rolls and index their placement for future use.
    // Also flag criticals, complications and successes so they can be
    // identified for display purposes.
    //
    results.rolls.forEach((roll, i) => {
      roll.index = i;

      if (roll.complication) {
        results.complications++;
      }

      if (roll.critical) {
        results.crits++;
        results.successes++;
      }

      if (roll.success) {
        results.successes++;
      }
    });

    // Work out if the roll was a success and add any bonuses that may apply
    // if it was.
    //
    const totalDifficulty =
      rollData.difficulty.base + rollData.difficulty.increase;

    results.result = 'failure';
    if (results.successes >= totalDifficulty) {
      results.successes += rollData.bonus.successes;
      results.momentum = results.successes - totalDifficulty;

      // add any bonus momentum
      results.momentum += rollData.bonus.momentum;

      results.result = 'success';
    }

    if (rollData.actorId) {
      const updateActorData = {};
      updateActorData['system.momentum'] = results.momentum;
      game.actors.get(rollData.actorId).update(updateActorData);
    }

    return results;
  }

  static getDefaultCombatDiceRollOptions() {
    return {
      base: {
        numDice: 1,
      },
      bonus: {
        attribute: 0,
        other: 0,
        reloads: 0,
        talent: 0,
      },
      damage: {
        location: null,
        type: null,
      },
      spends: {
        doom: 0,
        momentum: 0,
      },
      actorId: null,
      fixedResults: [],
      isReroll: false,
      itemId: null,
      numDice: 1,
      title: game.i18n.localize('MUTANT.CombatDice'),
    };
  }

  // TODO Document Method
  static async triggerReroll(message) {
    const actor = game.actors.get(message.speaker.actor);
    const messageData = message.flags.data;
    const type = messageData.type;

    // find all dice that have been selected for reroll
    const rerolls = [];
    $(message.content)
      .children('.selected')
      .each(function () {
        const rollIndex = this.id;
        rerolls.push(messageData.results.rolls[rollIndex]);
      });

    // now go through all dice in the result and remove those that are selected
    // to be rerolled which leaves us with the fixed results
    let norolls = messageData.results.rolls;

    rerolls.forEach(reroll => {
      for (let i = 0; i < norolls.length; i++) {
        if (reroll.index === norolls[i].index) {
          norolls.splice(i, 1);
          break;
        }
      }
    });

    const diceQty = rerolls.length;

    if (diceQty === 0) {
      return ui.notifications.warn(
        game.i18n.localize('MUTANT.NoDiceSelectedForReroll')
      );
    }

    // update the rollData settings with the fixed results and ensure it is
    // flagged as a reroll
    //
    messageData.rollData.fixedResults = norolls;
    messageData.rollData.isReroll = true;

    MutantChat.rerollNotification(diceQty, actor);

    const rerollText = game.i18n.localize('MUTANT.reroll');
    messageData.rollData.title += ` (${rerollText})`;

    let results;
    if (type === 'skill') {
      results = await Mc3eDice.calculateSkillRoll(messageData.rollData);
    } else {
      results = await Mc3eDice.calculateCombatDiceRoll(
        messageData.rollData
      );
    }

    const cardData = {
      actor: actor,
      item: messageData.item,
      results,
      rollData: messageData.rollData,
      type,
    };

    switch (type) {
      case 'combatDice':
        MutantChat.renderCombatDiceRollCard(cardData);
        break;
      case 'damage':
        MutantChat.renderDamageRollCard(cardData);
        break;
      case 'skill':
        MutantChat.renderSkillTestCard(cardData);
        break;
      case 'soak':
        MutantChat.renderSoakDiceRollCard(cardData);
        break;
      default:
        console.error(`Unknown roll type: ${type}`);
    }
  }

  /**
   * Add support for the Dice So Nice module
   * @param {Object} roll
   * @param {String} rollMode
   */
  static async showDiceSoNice(roll, rollMode) {
    if (
      game.modules.get('dice-so-nice') &&
      game.modules.get('dice-so-nice').active
    ) {
      let whisper = null;
      let blind = false;
      switch (rollMode) {
        case 'blindroll': {
          blind = true;
          break;
        }
        case 'gmroll': {
          const gmList = game.users.filter(user => user.isGM);
          const gmIDList = [];
          gmList.forEach(gm => gmIDList.push(gm.id));
          whisper = gmIDList;
          break;
        }
        case 'roll': {
          const userList = game.users.filter(user => user.active);
          const userIDList = [];
          userList.forEach(user => userIDList.push(user.id));
          whisper = userIDList;
          break;
        }
        case 'selfroll': {
          whisper = [game.user.id];
          break;
        }
        default: {
          break;
        }
      }
      await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
    }
  }

  /**
   * Merge new rolls and the preserved old rolls submitted to a reroll request
   */
  static async _mergeRerolls(newRolls, oldRolls) {
    const mergedRolls = [];

    let x = 0;
    for (let i = 0; i < oldRolls.length; i += 1) {
      const mergeRoll = oldRolls[i];
      if (mergeRoll.index === x) {
        mergedRolls.push(mergeRoll);
        x++;
        continue;
      }

      while (x < mergeRoll.index) {
        let newRoll = newRolls.shift();
        newRoll.index = x;
        mergedRolls.push(newRoll);
        x++;
      }

      mergedRolls.push(mergeRoll);
      x++;
    }

    // Now make sure we merge any left over rolls
    return [...mergedRolls, ...newRolls];
  }
}

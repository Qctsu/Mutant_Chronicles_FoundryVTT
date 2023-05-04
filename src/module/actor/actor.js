/**
 * Extend the base Actor class to implement additiona logic specialized for Mc3e
 */
import Counter from '../system/counter';

export default class Mc3eActor extends Actor {
  /**
   *
   * Set initial actor data based on type
   *
   */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    const nameMode = game.settings.get('mc3e', 'defaultTokenSettingsName');
    const barMode = game.settings.get('mc3e', 'defaultTokenSettingsBar');

    const prototypeToken = {
      bar1: {attribute: 'health.physical'}, // Default Bar 1 to Wounds
      bar2: {attribute: 'health.mental'}, // Default Bar 1 to Wounds
      displayName: nameMode, // Default display name to be on owner hover
      displayBars: barMode, // Default display bars to be on owner hover
      disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY, // Default disposition to hostile
      name: data.name, // Set token name to actor name
    };

    if (data.type === 'character') {
      prototypeToken.vision = true;
      prototypeToken.actorLink = true;
    }

    if (data.type === 'npc') {
      prototypeToken.actorLink = false;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
    }

    this.updateSource({prototypeToken});
  }

  async getAvailableDoom() {
    return game.settings.get('mc3e', 'doom');
  }

  async getAvailableFortune() {
    if (this.type === 'npc') {
      const doom = game.settings.get('mc3e', 'doom');
      return Math.floor(doom / 3);
    } else {
      return this.system.resources.fortune.value;
    }
  }

  async getAvailableMomentum() {
    return this.system.momentum + game.settings.get('mc3e', 'momentum');
  }

  getDifficultyIncrease(attribute) {
    const mentalSkill = ['int', 'per', 'wil'].includes(attribute);

    if (this.type === 'npc') {
      if (mentalSkill) {
        return this.system.health.mental.traumas.value;
      } else {
        return this.system.health.physical.wounds.value;
      }
    } else {
      if (mentalSkill) {
        return Object.values(this.system.health.mental.traumas.dots).reduce(
          (acc, w) => {
            acc += w.status === 'wounded' ? 1 : 0;
            return acc;
          },
          0
        );
      } else {
        return Object.values(this.system.health.physical.wounds.dots).reduce(
          (acc, w) => {
            acc += w.status === 'wounded' ? 1 : 0;
            return acc;
          },
          0
        );
      }
    }
  }

  // return an item owned by the user with the specified name, or null.
  getItemByName(itemName) {
    return this.items.find(item => item.name === itemName) || null;
  }

  getKits() {
    return this.collections.items.filter(entry => entry.type === 'kit');
  }

  getMaxResolve() {
    return (
      this.system.attributes.wil.value +
      this.system.skills.dis.expertise.value -
      this.system.health.mental.despair +
      this.system.health.mental.bonus
    );
  }

  getMaxVigor() {
    return (
      this.system.attributes.bra.value +
      this.system.skills.res.expertise.value -
      this.system.health.physical.fatigue +
      this.system.health.physical.bonus
    );
  }

  getMergedReloads() {
    const reloads = this.getReloads();

    const availableReloads = {};

    for (let reload of reloads) {
      if (!availableReloads[reload.name]) {
        availableReloads[reload.name] = {
          name: reload.name,
          uses: parseInt(reload.uses),
          max: parseInt(reload.max),
          ids: [reload.id],
        };
      } else {
        availableReloads[reload.name].uses += parseInt(reload.uses);
        availableReloads[reload.name].max += parseInt(reload.max);
        availableReloads[reload.name].ids.push(reload.id);
      }
    }

    let mergedReloads = [];
    /* eslint-disable-next-line no-unused-vars */
    for (const [key, value] of Object.entries(availableReloads)) {
      mergedReloads.push(availableReloads[key]);
    }

    return mergedReloads;
  }

  getReloads() {
    return this.items
      .filter(i => i.system.kitType === 'reload')
      .map(
        i =>
          ({
            id: i.id,
            name: i.name,
            uses: i.system.uses.value,
            max: i.system.uses.max,
          } || [])
      )
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
  }

  getSkillTargetNumberAndFocus(attribute, skillKey, expertiseKey) {
    const actorSkills = this.system.skills;

    let skillTn = parseInt(this.system.attributes[attribute].value) || 0;
    let skillFocus = 0;
    let skillExpertise = 0;

    if (this.type === 'npc') {
      skillFocus = skillExpertise =
        parseInt(actorSkills[expertiseKey].value) || 0;
      skillTn += skillExpertise;
    } else {
      skillExpertise = parseInt(actorSkills[skillKey].expertise.value) || 0;
      skillFocus = parseInt(actorSkills[skillKey].focus.value) || 0;
      skillTn += skillExpertise;
    }

    return [skillTn, skillExpertise, skillFocus];
  }

  /**
   * Augment the basic actor data with additional dynamic data
   */
  prepareData() {
    super.prepareData();

    // Get the Actor's data object
    const actorData = this.system;
    // const {data} = actorData;

    // Prepare Character data
    if (this.type === 'character') {
      this._prepareCharacterData(actorData);
    } else if (this.type === 'npc') {
      this._prepareNPCData(actorData);
    }

    if (actorData.qualities !== undefined) {
      const map = {};
      for (const [t] of Object.entries(map)) {
        const quality = actorData.qualities[t];
        if (quality === undefined) {
          /* eslint-disable-next-line no-continue */
          continue;
        }
      }
    }

    // Return the prepared Actor data
    return actorData;
  }

  /* -------------------------------------------- */

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Calculate Vigor
    if (
      isNaN(actorData.health.physical.bonus) ||
      actorData.health.physical.bonus === null
    ) {
      actorData.health.physical.bonus = 0;
    }

    actorData.health.physical.max =
      actorData.attributes.bra.value +
      actorData.skills.res.expertise.value -
      actorData.health.physical.fatigue +
      actorData.health.physical.bonus;

    if (actorData.health.physical.value === null) {
      actorData.health.physical.value =
        actorData.attributes.bra.value + actorData.skills.res.expertise.value;
    } else if (
      actorData.health.physical.value > actorData.health.physical.max
    ) {
      actorData.health.physical.value = actorData.health.physical.max;
    } else if (actorData.health.physical.value < 0) {
      actorData.health.physical.value = 0;
    }

    // Calculate Resolve
    if (
      isNaN(actorData.health.mental.bonus) ||
      actorData.health.mental.bonus === null
    ) {
      actorData.health.mental.bonus = 0;
    }

    actorData.health.mental.max =
      actorData.attributes.wil.value +
      actorData.skills.dis.expertise.value -
      actorData.health.mental.despair +
      actorData.health.mental.bonus;

    if (actorData.health.mental.value === null) {
      actorData.health.mental.value =
        actorData.attributes.wil.value + actorData.skills.dis.expertise.value;
    } else if (actorData.health.mental.value > actorData.health.mental.max) {
      actorData.health.mental.value = actorData.health.mental.max;
    } else if (actorData.health.mental.value < 0) {
      actorData.health.mental.value = 0;
    }

    // Set TN for Skills
    for (const [s, skl] of Object.entries(actorData.skills)) {
      skl.tn.value =
        skl.expertise.value + actorData.attributes[skl.attribute].value;
      if (actorData.skills[s].expertise.value > 0) {
        actorData.skills[s].trained = true;
      }
    }

    // Prepare Upkeep Cost
    actorData.resources.upkeep.value =
      3 + actorData.background.standing.value - actorData.background.renown;
    if (actorData.resources.upkeep.value < 0) {
      actorData.resources.upkeep.value = 0;
    }

    // Automatic Actions
    actorData.actions = [];

    // Experience
    // actorData.resources.xp.value = character.exp;
  }

  /* -------------------------------------------- */

  /**
   * Prepare Character type specific data
   */
  _prepareNPCData(actorData) {
    let maxWounds = 1; // default minion maxWounds

    if (actorData.type === 'toughened') {
      maxWounds = 2;
    } else if (actorData.type === 'nemesis') {
      maxWounds = 5;
    }

    actorData.health.mental.traumas.max = maxWounds;
    actorData.health.physical.wounds.max = maxWounds;
  }

  static addDoom(doomSpend) {
    Counter.changeCounter(+`${doomSpend}`, 'doom');
  }

  static addMomentum(momentumSpend) {
    Counter.changeCounter(+`${momentumSpend}`, 'momentum');
  }

  static payDoom(actorData, doomSpend) {
    if (!doomSpend > 0) return;

    const actor = game.actors.get(actorData._id);

    Counter.changeCounter(+`${doomSpend}`, 'doom');

    let html = `<h2>${game.i18n.localize('MUTANT.rollDoomPaid')}</h2><div>`;

    html += `<p>${game.i18n.format('MUTANT.rollDoomPaidChatText', {
      character: `<b>${actor.name}</b>`,
      spent: `<b>${doomSpend}</b>`,
    })}</p></div>`;

    const chatData = {
      user: game.user.id,
      content: html,
    };

    ChatMessage.create(chatData);
  }

  static spendFortune(actorData, fortuneSpend) {
    if (!fortuneSpend > 0) return;

    const newValue = actorData.system.resources.fortune.value - fortuneSpend;

    if (newValue < 0) {
      const error = 'Fortune spend would exceed available fortune points.';
      throw error;
    } else {
      const updateActorData = {
        'system.resources.fortune.value': newValue,
      };
      game.actors.get(actorData._id).update(updateActorData);
    }
  }

  static buyFortune(actor, numFortune) {
    if (!numFortune > 0) return;
    if (!actor.type === 'npc') return;

    const doomCost = numFortune * 3;
    const newValue = game.settings.get('mc3e', 'doom') - doomCost;

    if (newValue < 0) {
      const error = 'Doom cost of Fortune would exceed available Doom points.';
      throw error;
    } else {
      Counter.changeCounter(-`${doomCost}`, 'doom');
    }

    let html = `<h2>${game.i18n.localize('MUTANT.rollFortuneBought')}</h2><div>`;

    html += `<p>${game.i18n.format('MUTANT.rollFortuneBoughtChatText', {
      character: `<b>${actor.name}</b>`,
      spent: `<b>${doomCost}</b>`,
      fortune: `<b>${numFortune}</b>`,
    })}</p></div>`;

    const chatData = {
      user: game.user.id,
      content: html,
    };

    ChatMessage.create(chatData);
  }

  static spendDoom(actor, doomSpend) {
    if (!doomSpend > 0) return;

    const newValue = game.settings.get('mc3e', 'doom') - doomSpend;

    if (newValue < 0) {
      const error = 'Doom spend would exceed available doom points.';
      throw error;
    } else {
      Counter.changeCounter(-`${doomSpend}`, 'doom');
    }

    let html = `<h2>${game.i18n.localize('MUTANT.rollDoomSpent')}</h2><div>`;

    html += `<p>${game.i18n.format('MUTANT.rollDoomSpentChatText', {
      character: `<b>${actor.name}</b>`,
      spent: `<b>${doomSpend}</b>`,
    })}</p></div>`;

    const chatData = {
      user: game.user.id,
      content: html,
    };

    ChatMessage.create(chatData);
  }

  static spendMomentum(actorData, momentumSpend) {
    if (!momentumSpend > 0) return;

    const actor = game.actors.get(actorData._id);

    let playerMomentum = actor.system.momentum;
    let poolMomentum = game.settings.get('mc3e', 'momentum');

    const availableMomentum = poolMomentum + playerMomentum;

    if (momentumSpend > availableMomentum) {
      const error = 'Momentum spend would exceed available momentum points.';
      throw error;
    } else {
      let newPoolMomentum = poolMomentum;

      playerMomentum -= momentumSpend;

      if (playerMomentum < 0) {
        newPoolMomentum += playerMomentum;
        playerMomentum = 0;
      }

      actor.update({'system.momentum': playerMomentum});
      Counter.setCounter(`${newPoolMomentum}`, 'momentum');

      let html = `<h2>${game.i18n.localize(
        'MUTANT.rollMomentumSpent'
      )}</h2><div>`;

      html += `<p>${game.i18n.format('MUTANT.rollMomentumSpentChatText', {
        character: `<b>${actor.name}</b>`,
        spent: `<b>${momentumSpend}</b>`,
      })}</p></div>`;

      const chatData = {
        user: game.user.id,
        content: html,
      };

      ChatMessage.create(chatData);
    }
  }

  // static spendReload(actor, reloadSpend, reloadItemId) {
  //   const reloadItem = actor.items.find(i => i._id === reloadItemId);

  //   const newValue = reloadItem.system.uses.value - reloadSpend;

  //   if (newValue < 0) {
  //     const error = 'Resource spend would exceed available reloads.';
  //     throw error;
  //   } else {
  //     reloadItem.system.uses.value = newValue;
  //     actor.update();
  //   }
  // }

  async spendReloads(reload, quantity) {
    console.log(reload);

    while (quantity > 0 && reload.ids.length > 0) {
      const id = reload.ids.pop();
      const reloadItem = this.getEmbeddedDocument('Item', id);

      const remaining = reloadItem.system.uses.value;

      let useCount = 0;
      if (remaining > 0) {
        if (quantity >= remaining) {
          useCount = remaining;
          quantity -= remaining;
        } else {
          useCount = quantity;
        }

        this.updateEmbeddedDocuments('Item', [
          {
            _id: id,
            'system.uses.value': remaining - useCount,
          },
        ]);
      }
    }
  }

  _getModifiers(type, specifier) {
    let mod;
    if (type === 'skill') {
      const difficultyLevels = CONFIG.rollDifficultyLevels;
      const diceModSpends = CONFIG.skillRollResourceSpends;
      const prefilledDifficulty = this._getPrefilledDifficulty(specifier.skill);
      const prefilledAttribute = this._getPrefilledAttribute(specifier.skill);
      if (this.type === 'npc') {
        mod = {
          difficulty: difficultyLevels,
          prefilledDifficulty: prefilledDifficulty.difficulty,
          prefilledAttribute: prefilledAttribute.attribute,
          diceModifier: diceModSpends,
          successModifier: 0,
          npcAttributes: CONFIG.attributes,
          actorType: this.type,
        };
        return mod;
      }
      mod = {
        difficulty: difficultyLevels,
        prefilledDifficulty: prefilledDifficulty.difficulty,
        difficultyTooltip: prefilledDifficulty.tooltipText,
        diceModifier: diceModSpends,
        successModifier: 0,
        actorType: this.type,
      };
      return mod;
    }
    if (type === 'damage') {
      const attackTypes = CONFIG.weaponTypes;

      let wType = '';
      let attacker = 'character'; // default to character
      let attackBonuses = this._attackBonuses();

      if (specifier.type === 'display') {
        wType = 'display';
      } else if (specifier.type === 'weapon') {
        wType = specifier.system.weaponType;
      } else if (specifier.type === 'npcattack') {
        attacker = 'npc';
        wType = specifier.system.attackType;
      }

      mod = {
        attacker,
        attackTypes,
        baseDamage: specifier.system.damage.dice,
        weaponType: wType,
        momentumModifier: 0,
        reloadModifier: 0,
        talentModifier: 0,
        attackBonuses,
      };
    }
    return mod;
  }

  /**
   * Uses selected field of expertise to determine which attribute the test
   * should use by default.
   * @param expertise Expertise being rolled
   */
  _getPrefilledAttribute(expertise) {
    return {attribute: CONFIG.expertiseAttributeMap[expertise]};
  }

  /**
   * Uses contextual data like conditions or harms to determine how much to
   * increase test difficulty by
   * @param skill Skill being used
   */
  _getPrefilledDifficulty(skill) {
    const tooltip = [];
    let difficulty = 1;
    if (this.hasCondition('dazed')) {
      difficulty += 1;
      tooltip.push({name: CONFIG.conditionTypes.dazed, value: 1});
    }

    // Open to change here, as what is affected and what isn't is up in the air
    const blindedAffected = [
      'obs',
      'ins',
      'ran',
      'mel',
      'sai',
      'par',
      'cmb',
      'mov',
      'sns',
    ];
    if (this.hasCondition('blind') && blindedAffected.includes(skill)) {
      difficulty += 2;
      tooltip.push({name: CONFIG.conditionTypes.blind, value: 2});
    }

    const deafAffected = ['obs', 'ins', 'com', 'per', 'sns'];
    if (this.hasCondition('deaf') && deafAffected.includes(skill)) {
      difficulty += 2;
      tooltip.push({name: CONFIG.conditionTypes.deaf, value: 2});
    }

    if (this.actorType === 'character') {
      const physicalTests = ['agi', 'bra', 'coo'];
      const mentalTests = ['awa', 'int', 'per', 'wil'];

      const wounds = Object.values(
        this.system.health.physical.wounds.dots
      ).reduce((acc, w) => {
        acc += w.status === 'wounded' ? 1 : 0;
        return acc;
      }, 0);

      if (
        wounds > 0 &&
        physicalTests.includes(CONFIG.skillAttributeMap[skill])
      ) {
        difficulty += wounds;
        tooltip.push({name: 'Wounds', value: wounds});
      }

      const trauma = Object.values(
        this.system.health.mental.traumas.dots
      ).reduce((acc, w) => {
        acc += w.status === 'wounded' ? 1 : 0;
        return acc;
      }, 0);
      if (trauma > 0 && mentalTests.includes(CONFIG.skillAttributeMap[skill])) {
        difficulty += trauma;
        tooltip.push({name: 'Trauma', value: trauma});
      }
    } else if (this.actorType === 'npc') {
      const physicalTests = ['agi', 'bra'];
      const mentalTests = ['per', 'int', 'awa'];
      const wounds = this.system.health.physical.wounds.value;
      const traumas = this.system.health.mental.traumas.value;

      if (
        wounds > 0 &&
        physicalTests.includes(CONFIG.expertiseAttributeMap[skill])
      ) {
        difficulty += wounds;
        tooltip.push({name: 'Wounds', value: wounds});
      }
      if (
        traumas > 0 &&
        mentalTests.includes(CONFIG.expertiseAttributeMap[skill])
      ) {
        difficulty += traumas;
        tooltip.push({name: 'Traumas', value: traumas});
      }
    }

    difficulty += this.system.difficultyModifier || 0;

    if (difficulty > 5) difficulty = 5;

    let tooltipText = '';
    if (tooltip.length)
      tooltipText = tooltip.map(i => `${i.name}: +${i.value}`).join('\n');

    return {difficulty, tooltipText};
  }

  _attackBonuses() {
    const isNpc = this.isNpc();

    return {
      threaten: isNpc ? 0 : this._attributeBonus('per'),
      melee: isNpc ? 0 : this._attributeBonus('bra'),
      ranged: isNpc ? 0 : this._attributeBonus('awa'),
    };
  }

  _attributeBonus(attribute) {
    const attributeValue = this.system.attributes[attribute].value;

    if (attributeValue <= 8) return 0;
    if (attributeValue <= 9) return 1;
    if (attributeValue <= 11) return 2;
    if (attributeValue <= 13) return 3;
    if (attributeValue <= 15) return 4;
    if (attributeValue >= 16) return 5;
  }

  async getRollOptions(rollNames) {
    const flag = this.getFlag(game.system.id, 'rollOptions') ?? {};
    return rollNames
      .flatMap(rollName =>
        // convert flag object to array containing the names of all fields with a truthy value
        Object.entries(flag[rollName] ?? {}).reduce(
          (opts, [key, value]) => opts.concat(value ? key : []),
          []
        )
      )
      .reduce((unique, option) => {
        // ensure option entries are unique
        return unique.includes(option) ? unique : unique.concat(option);
      }, []);
  }

  async addCondition(effect, value = 1) {
    if (typeof effect === 'string')
      effect = duplicate(
        game.mc3e.config.statusEffects.find(e => e.id === effect)
      );
    if (!effect) return 'No Effect Found';

    if (!effect.id) return 'Conditions require an id field';

    effect.label = game.i18n.localize(effect.label);

    // eslint-disable-next-line prefer-const
    let existing = this.hasCondition(effect.id);
    if (existing && existing.flags.mc3e.value === null) {
      return existing;
    }

    if (existing) {
      existing = duplicate(existing);
      existing.flags.mc3e.value += value;
      return this.updateEmbeddedDocuments('ActiveEffect', [existing]);
    }

    if (!existing) {
      if (Number.isNumeric(effect.flags.mc3e.value)) {
        effect.flags.mc3e.value = value;
      }

      effect['flags.core.statusId'] = effect.id;
    }
    return this.createEmbeddedDocuments('ActiveEffect', [effect]);
  }

  isNpc() {
    return this.type === 'npc';
  }

  async removeCondition(effect, value = 1) {
    effect = duplicate(
      game.mc3e.config.statusEffects.find(e => e.id === effect)
    );
    if (!effect) {
      return 'No Effect Found';
    }
    if (!effect.id) {
      return 'Conditions require an id field';
    }

    // eslint-disable-next-line prefer-const
    let existing = this.hasCondition(effect.id);
    if (existing) {
      const duplicated = duplicate(existing);
      duplicated.flags.mc3e.value -= value;

      if (duplicated.flags.mc3e.value <= 0) {
        return this.deleteEmbeddedDocuments('ActiveEffect', [existing.id]);
      }

      return this.updateEmbeddedDocuments('ActiveEffect', [duplicated]);
    }
  }

  hasCondition(conditionKey) {
    const existing = this.effects.find(
      i => i.flags.core.statusId === conditionKey
    );
    return existing;
  }

  // Return the type of the current actor
  get actorType() {
    return this.type;
  }
}

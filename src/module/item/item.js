import SoakDiceRoller from '../apps/soak-dice-roller';
import DamageRoller from '../apps/damage-roller';

export default class Mc3eItem extends Item {
  prepareData() {
    super.prepareData();
    // const item = this.system;
  }

  async postItem() {
    const templateData = {
      actorId: '',
      item: this.toObject(false),
      data: await this.getChatData(),
    };

    let tokenId = '';

    // Actor doesn't exist if the Post button is used to post the item to chat
    if (this.actor) {
      templateData.actorId = this.actor.id;
      if (this.actor.isToken) {
        tokenId = this.actor.token.id;
      }
    }

    const template = `systems/mc3e/templates/chat/${this.type}-card.html`;
    const html = await renderTemplate(template, templateData);

    const chatData = {
      user: game.user.id,
      speaker: null,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
    };

    // Actor doesn't exist if the Post button is used to post the item to chat
    if (this.actor) {
      chatData.speaker = ChatMessage.getSpeaker({
        actor: this.actor,
        token: this.actor.token,
      });
    }

    ChatMessage.create(chatData, {displaySheet: false}).then(msg => {
      msg.setFlag('mc3e', 'itemId', this._id);
      msg.setFlag('mc3e', 'tokenId', tokenId);
    });
  }

  async getChatData(htmlOptions = {}) {
    const itemType = this.type;

    const data = this[`_${itemType}ChatData`]();

    htmlOptions = {...htmlOptions, async: true};

    if (data) {
      data.description.value = await TextEditor.enrichHTML(
        data.description.value,
        htmlOptions
      );
    }

    return data;
  }

  canCauseDamage() {
    return (
      this.type === 'weapon' ||
      this.type === 'npcattack' ||
      this.type === 'display'
    );
  }

  getQuality(qualityName) {
    const data = duplicate(this.system);

    let qualitiesObject;
    if ((data.qualities.value || []).length !== 0) {
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        if (data.qualities.value[i].type === qualityName) {
          qualitiesObject = data.qualities.value[i];
          break;
        }
      }
    }

    return qualitiesObject;
  }

  getSoak() {
    const quality = this.getQuality('shieldx');
    const soak = quality !== undefined ? parseInt(quality.value) : 0;
    return soak;
  }

  triggerDamageRoll() {
    const options = {
      item: this,
    };

    new DamageRoller(this.actor, options).render(true);
  }

  triggerSoakRoll() {
    const options = {
      type: 'cover',
      itemName: this.name,
      soak: this.getSoak(),
    };

    new SoakDiceRoller(this.actor, options).render(true);
  }

  skillToUse(actorType) {
    // TODO This could be reworked into a more generic method for returning
    // the default skill used for any item
    if (actorType === 'npc') {
      if (this.system.attackType === 'melee') {
        return 'cmb';
      } else if (this.system.attackType === 'ranged') {
        return 'cmb';
      } else if (this.system.attackType === 'threaten') {
        return 'scl';
      }
    }

    if (actorType === 'character') {
      if (this.system.skillOverride && this.system.skillOverride !== '') {
        return this.system.skillOverride;
      } else if (this.system.weaponType === 'melee') {
        return 'mel';
      } else if (this.system.weaponType === 'ranged') {
        return 'ran';
      } else if (this.type === 'display') {
        return this.system.skill;
      } else if (this.type === 'spell') {
        return 'sor';
      }
    }
  }

  /* -------------------------------------------- */

  _actionChatData() {
    if (this.type !== 'action') {
      throw new Error(
        'tried to create an action chat data for a non-action item'
      );
    }

    const data = duplicate(this.system);

    let associatedWeapon = null;
    if (data.weapon.value)
      associatedWeapon = this.actor.getEmbeddedDocument(data.weapon.value);

    const props = [
      CONFIG.MUTANT.actionTypes[data.actionType],
      CONFIG.MUTANT.actionCounts[data.actionCount],
      CONFIG.MUTANT.actionCategories[data.actionCategory],
      associatedWeapon ? associatedWeapon.name : null,
    ];

    data.properties = props.filter(p => p);

    return data;
  }

  _enchantmentChatData() {
    if (this.type !== 'enchantment') {
      throw new Error('tried to create a spell chat data for a non-spell item');
    }

    const data = duplicate(this.system);
    const effects = data.effects.value;
    const properties = [];
    const details = [];

    const qualities = [];
    if ((effects || []).length !== 0) {
      let effectsObject;
      for (let i = 0; i < effects.length; i += 1) {
        if (effects[i].value) {
          effectsObject = {
            label:
              `${effects[i].label} ${effects[i].value}` ||
              effects[i].label.charAt(0).toUpperCase() +
                effects[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                effects[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          const labelN = effects[i].label;
          effectsObject = {
            label:
              CONFIG.MUTANT.weaponQualities[labelN] ||
              effects[i].label.charAt(0).toUpperCase() +
                effects[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                effects[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(effectsObject);
      }
    }
    const enchantmentType = {
      label: 'MUTANT.enchantmentTypeLabel',
      detail: CONFIG.MUTANT.enchantmentTypes[data.enchantmentType],
    };
    details.push(enchantmentType);
    if (enchantmentType.detail === 'Exploding Powder') {
      const enchantmentDamage = {
        label: 'MUTANT.enchantmentDamageLabel',
        detail: CONFIG.MUTANT.damageDice[data.damage.dice],
      };
      const enchantmentItem = {
        label: 'MUTANT.enchantmentItemLabel',
        detail:
          CONFIG.MUTANT.enchantmentExplodingItems[data.traits.explodingItem],
      };
      const enchantmentStrength = {
        label: 'MUTANT.enchantmentStrengthLabel',
        detail: CONFIG.MUTANT.enchantmentStrengths[data.traits.strength],
      };
      details.push(enchantmentItem);
      details.push(enchantmentDamage);
      details.push(enchantmentStrength);
    } else if (enchantmentType.detail === 'Blinding Powder') {
      const enchantmentDamage = {
        label: 'MUTANT.enchantmentDamageLabel',
        detail: CONFIG.MUTANT.damageDice[data.damage.dice],
      };
      const enchantmentStrength = {
        label: 'MUTANT.enchantmentStrengthLabel',
        detail: CONFIG.MUTANT.enchantmentBlindingStrengths[data.traits.strength],
      };
      details.push(enchantmentStrength);
      details.push(enchantmentDamage);
    } else if (enchantmentType.detail === 'Burning Liquid') {
      const enchantmentDamage = {
        label: 'MUTANT.enchantmentDamageLabel',
        detail: CONFIG.MUTANT.damageDice[data.damage.dice],
      };
      const enchantmentStrength = {
        label: 'MUTANT.enchantmentVolatilityLabel',
        detail: CONFIG.MUTANT.enchantmentVolatilities[data.traits.volatility],
      };
      details.push(enchantmentDamage);
      details.push(enchantmentStrength);
    } else if (enchantmentType.detail === 'Reinforced Fabric') {
      const enchantmentIngredients = {
        label: 'MUTANT.enchantmentIngredientsLabel',
        detail: CONFIG.MUTANT.enchantmentIngredients[data.traits.ingredients],
      };
      const localize = game.i18n.localize.bind(game.i18n);
      if ((data.damage.hitLocation || []).length !== 0) {
        for (let i = 0; i < data.damage.hitLocation.value.length; i += 1) {
          properties.push(
            `${data.damage.hitLocation.value[i]} ${localize(
              'MUTANT.coverageLabel'
            )}`
          );
        }
      }
      data.properties = properties.filter(p => p !== null);
      details.push(enchantmentIngredients);
    } else if (enchantmentType.detail === 'Upas-Glass') {
      const enchantmentCover = {
        label: 'MUTANT.enchantmentCoverLabel',
        detail: CONFIG.MUTANT.damageDice[data.damage.dice],
      };
      const enchantmentSize = {
        label: 'MUTANT.upasGlassSizeLabel',
        detail: CONFIG.MUTANT.upasGlassSizes[data.traits.size],
      };
      details.push(enchantmentSize);
      details.push(enchantmentCover);
    } else if (enchantmentType.detail === 'Talisman') {
      const talismanHindrance = {
        label: 'MUTANT.enchantmentHindranceLabel',
        detail: data.traits.hindrance,
      };
      const talismanType = {
        label: 'MUTANT.enchantmentTalismanLabel',
        detail: CONFIG.MUTANT.enchantmentTalismanTypes[data.traits.talismanType],
      };
      details.push(talismanHindrance);
      details.push(talismanType);
    } else {
      const enchantmentUse = {
        label: 'MUTANT.lotusPollenUseLabel',
        detail: CONFIG.MUTANT.lotusPollenUses[data.traits.lotusPollenUse],
      };
      const enchantmentColor = {
        label: 'MUTANT.lotusPollenColorLabel',
        detail: CONFIG.MUTANT.lotusPollenColors[data.traits.lotusPollenColor],
      };
      const enchantmentForm = {
        label: 'MUTANT.lotusPollenFormLabel',
        detail: CONFIG.MUTANT.lotusPollenForms[data.traits.lotusPollenForm],
      };
      details.push(enchantmentUse);
      details.push(enchantmentColor);
      details.push(enchantmentForm);
    }

    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }

  _spellChatData() {
    if (this.type !== 'spell') {
      throw new Error('tried to create a spell chat data for a non-spell item');
    }

    const data = duplicate(this.system);
    const details = [];

    if (data.difficulty.includes) {
      const difficultyIncludes = {
        label: 'MUTANT.difficultyIncludesLabel',
        detail: data.difficulty.includes,
      };
      details.push(difficultyIncludes);
    }

    if (data.duration) {
      const duration = {
        label: 'MUTANT.spellDurationLabel',
        detail: data.duration,
      };
      details.push(duration);
    }

    if (data.cost) {
      const cost = {
        label: 'MUTANT.spellCostLabel',
        detail: data.cost,
      };
      details.push(cost);
    }

    if (data.notes) {
      const notes = {
        label: 'MUTANT.spellNotesHeader',
        detail: data.notes,
      };
      details.push(notes);
    }

    data.itemDetails = details.filter(p => p !== null);

    return data;
  }

  _armorChatData() {
    if (this.type !== 'armor') {
      throw new Error(
        'tried to create an armor chat data for a non-armor item'
      );
    }

    const localize = game.i18n.localize.bind(game.i18n);
    const data = duplicate(this.system);
    const qualities = [];
    if ((data.qualities.value || []).length !== 0) {
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        const qualitiesObject = {
          label:
            CONFIG.armorQualities[data.qualities.value[i]] ||
            data.qualities.value[i].charAt(0).toUpperCase() +
              data.qualities.value[i].slice(1),
          description:
            CONFIG.qualitiesDescriptions[data.qualities.value[i]] || '',
        };
        qualities.push(qualitiesObject);
      }
    }
    const properties = [
      `${localize(CONFIG.MUTANT.armorTypes[data.armorType])}`,
      `${data.soak || 0} ${localize('MUTANT.armorSoakLabel')}`,
      data.equipped ? localize('MUTANT.armorEquippedLabel') : null,
    ];
    if ((data.coverage.value || []).length !== 0) {
      for (let i = 0; i < data.coverage.value.length; i += 1) {
        properties.push(
          `${data.coverage.value[i]} ${localize('MUTANT.coverageLabel')}`
        );
      }
    }
    data.properties = properties.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);
    return data;
  }

  _kitChatData() {
    if (this.type !== 'kit') {
      throw new Error('tried to create a kit chat data for a non-kit item');
    }

    const localize = game.i18n.localize.bind(game.i18n);
    const data = duplicate(this.system);

    data.kitTypeString = CONFIG.kitTypes[data.kitType];

    data.properties = [
      data.kitTypeString,
      `${data.uses.value}/${data.uses.max} ${localize('MUTANT.kitUsesLabel')}`,
    ];

    data.hasCharges = data.uses.value >= 0;

    return data;
  }

  _transportationChatData() {
    if (this.type !== 'transportation') {
      throw new Error(
        'tried to create a transportation chat data for a non-transpo item'
      );
    }

    const details = [];
    const data = duplicate(this.system);

    if (data.category) {
      const category = {
        label: 'MUTANT.transpoCategoryLabel',
        detail: CONFIG.MUTANT.transpoCategories[data.category],
      };
      details.push(category);
    }
    if (data.transpoType) {
      let ttype;
      if (data.category === 'mounts') {
        ttype = {
          label: 'MUTANT.transpoTypeLabel',
          detail: CONFIG.MUTANT.transpoMountTypes[data.transpoType],
        };
      } else if (data.category === 'carts') {
        ttype = {
          label: 'MUTANT.transpoTypeLabel',
          detail: CONFIG.MUTANT.transpoCartTypes[data.transpoType],
        };
      } else {
        ttype = {
          label: 'MUTANT.transpoTypeLabel',
          detail: CONFIG.MUTANT.transpoBoatTypes[data.transpoType],
        };
      }
      details.push(ttype);
    }
    if (data.passengers.capacity) {
      const capacity = {
        label: 'MUTANT.transpoPassengerCapLabel',
        detail: String(data.passengers.capacity),
      };
      details.push(capacity);
    }
    if (data.capabilities !== '') {
      const capabilities = {
        label: 'MUTANT.transpoCapabilitiesLabel',
        detail: CONFIG.MUTANT.transpoCapabilities[data.capabilities],
      };
      details.push(capabilities);
    }
    if (data.animals !== '') {
      const animals = {
        label: 'MUTANT.transpoAnimalsLabel',
        detail: CONFIG.MUTANT.transpoAnimals[data.animals],
      };
      details.push(animals);
    }

    data.itemDetails = details.filter(p => p !== null);

    return data;
  }

  _talentChatData() {
    if (this.type !== 'talent') {
      throw new Error(
        'tried to create a talent chat data for a non-talent item'
      );
    }

    const data = duplicate(this.system);
    const details = [];

    const props = [
      `Rank ${data.rank.value || 0}`,
      CONFIG.MUTANT.skills[data.skill],
      data.actionType ? CONFIG.MUTANT.actionTypes[data.actionType] : null,
    ];

    data.properties = props.filter(p => p);

    if (data.prerequisites) {
      const prereqs = {
        label: 'MUTANT.talentRequiresLabel',
        detail: data.prerequisites,
      };
      details.push(prereqs);
    }

    const qualities = [];
    if ((data.qualities || []).length !== 0) {
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        const qualitiesObject = {
          label:
            CONFIG.MUTANT.talentQualities[data.qualities.value[i]] ||
            data.qualities.value[i].charAt(0).toUpperCase() +
              data.qualities.value[i].slice(1),
          description:
            CONFIG.MUTANT.qualitiesDescriptions[data.qualities.value[i]] || '',
        };
        qualities.push(qualitiesObject);
      }
    }

    if (data.talentType) {
      const ttypes = {
        label: `${data.talentType || ''}`,
        description: `${data.description} || ''`,
      };
      qualities.push(ttypes);
    }
    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => p);
    return data;
  }

  _weaponChatData() {
    if (this.type !== 'weapon') {
      throw new Error(
        'tried to create a weapon chat data for a non-weapon item'
      );
    }

    const data = duplicate(this.system);

    const qualities = [];
    const properties = [];
    const details = [];

    if ((data.qualities.value || []).length !== 0) {
      let qualitiesObject;
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        if (data.qualities.value[i].type === 'shieldx') {
          data.hasShieldSoak = true;
          data.shieldSoak = parseInt(data.qualities.value[i].value) || 1;
        }
        if (data.qualities.value[i].value) {
          qualitiesObject = {
            label:
              `${data.qualities.value[i].label} ${data.qualities.value[i].value}` ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          qualitiesObject = {
            label:
              CONFIG.MUTANT.weaponQualities[data.qualities.value[i].label] ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(qualitiesObject);
      }
    }

    const weaponGroup = {
      label: 'MUTANT.groupLabel',
      detail: CONFIG.MUTANT.weaponGroups[data.group],
    };
    details.push(weaponGroup);

    const weaponDamage = {
      label: 'MUTANT.baseDamageLabel',
      detail: CONFIG.MUTANT.damageDice[data.damage.dice],
    };
    details.push(weaponDamage);

    let weaponRange;
    if (data.weaponType === 'ranged') {
      weaponRange = {
        label: 'MUTANT.rangeLabel',
        detail: CONFIG.MUTANT.weaponRanges[data.range],
      };
    } else {
      weaponRange = {
        label: 'MUTANT.reachLabel',
        detail: CONFIG.MUTANT.weaponReaches[data.range],
      };
    }
    details.push(weaponRange);

    if (data.size) {
      properties.push(CONFIG.MUTANT.weaponSizes[data.size]);
    }

    data.properties = properties.filter(p => !!p);
    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }

  _npcattackChatData() {
    if (this.type !== 'npcattack') {
      throw new Error(
        'tried to create an NPC Attack chat data for an incorrect item'
      );
    }

    const data = duplicate(this.system);
    const qualities = [];
    const details = [];

    if ((data.qualities.value || []) !== 0) {
      let qualitiesObject;
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        if (data.qualities.value[i].value) {
          qualitiesObject = {
            label:
              `${data.qualities.value[i].label} ${data.qualities.value[i].value}` ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          qualitiesObject = {
            label:
              CONFIG.MUTANT.weaponQualities[data.qualities.value[i].label] ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(qualitiesObject);
      }
    }

    const attackDamage = {
      label: 'MUTANT.damageLabel',
      detail: CONFIG.MUTANT.damageDice[data.damage.dice],
    };
    details.push(attackDamage);

    const attackType = {
      label: 'MUTANT.damageTypeLabel',
      detail: CONFIG.MUTANT.damageTypes[data.damage.type],
    };
    details.push(attackType);

    let attackRange;
    if (data.attackType === 'ranged') {
      attackRange = {
        label: 'MUTANT.rangeLabel',
        detail: CONFIG.MUTANT.weaponRanges[data.range],
      };
    } else if (data.attackType === 'threaten') {
      attackRange = {
        label: 'MUTANT.rangeLabel',
        detail: CONFIG.MUTANT.weaponRanges[data.range],
      };
    } else {
      attackRange = {
        label: 'MUTANT.reachLabel',
        detail: CONFIG.MUTANT.weaponReaches[data.range],
      };
    }
    details.push(attackRange);

    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }

  _miscellaneousChatData() {
    if (this.type !== 'miscellaneous') {
      throw new Error(
        'tried to create an npcaction chat data for a non-npcaction item'
      );
    }
    const data = duplicate(this.system);
    return data;
  }

  _npcactionChatData() {
    if (this.type !== 'npcaction') {
      throw new Error(
        'tried to create an npcaction chat data for a non-npcaction item'
      );
    }

    const data = duplicate(this.system);

    const props = [CONFIG.MUTANT.npcActionTypes[data.actionType]];

    data.properties = props.filter(p => p);

    return data;
  }

  _displayChatData() {
    if (this.type !== 'display') {
      throw new Error(
        'tried to create a display chat data for a non-display item'
      );
    }

    const data = duplicate(this.system);
    const qualities = [];
    const properties = [];
    const details = [];

    if ((data.qualities.value || []).length !== 0) {
      let qualitiesObject;
      for (let i = 0; i < data.qualities.value.length; i += 1) {
        if (data.qualities.value[i].value) {
          qualitiesObject = {
            label:
              `${data.qualities.value[i].label} ${data.qualities.value[i].value}` ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        } else {
          qualitiesObject = {
            label:
              CONFIG.MUTANT.weaponQualities[data.qualities.value[i].label] ||
              data.qualities.value[i].label.charAt(0).toUpperCase() +
                data.qualities.value[i].label.slice(1),
            description:
              CONFIG.MUTANT.qualitiesDescriptions[
                data.qualities.value[i].label.replace(' ', '').toLowerCase()
              ] || '',
          };
        }
        qualities.push(qualitiesObject);
      }
    }

    const displaySkill = {
      label: 'MUTANT.displaySkillLabel',
      detail: CONFIG.MUTANT.skills[data.skill],
    };
    details.push(displaySkill);

    const displayDamage = {
      label: 'MUTANT.baseDamageLabel',
      detail: CONFIG.MUTANT.damageDice[data.damage.dice],
    };
    details.push(displayDamage);

    const displayRange = {
      label: 'MUTANT.rangeLabel',
      detail: CONFIG.MUTANT.weaponRanges[data.range],
    };
    details.push(displayRange);

    data.properties = properties.filter(p => !!p);
    data.itemDetails = details.filter(p => p !== null);
    data.qualities = qualities.filter(p => !!p);

    return data;
  }
}

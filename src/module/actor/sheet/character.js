import ActorSheetMc3e from './base';
import C2Utility from '../../../scripts/utility';
import {calculateEncumbrance} from '../../item/encumbrance';
import MomentumBanker from '../../apps/momentum-banker';

class ActorSheetMc3eCharacter extends ActorSheetMc3e {
  static get defaultOptions() {
    const options = super.defaultOptions;

    mergeObject(options, {
      classes: options.classes.concat([
        'mc3e',
        'actor',
        'pc',
        'character-sheet',
      ]),
      width: 713,
      height: 800,
      tabs: [
        {
          navSelector: '.sheet-navigation',
          contentSelector: '.sheet-content',
          initial: 'character',
        },
      ],
      dragDrop: [{dragSelector: '.item-list .item', dropSelector: null}],
    });

    return options;
  }

  get template() {
    const path = 'systems/mc3e/templates/actors/';
    if (!game.user.isGM && this.actor.limited)
      return `${path}readonly-sheet.html`;
    return `${path}character-sheet.html`;
  }

  async getData(options = {}) {
    const context = await super.getData(options);

    // Update skill labels
    if (context.system.skills !== undefined) {
      for (const [s, skl] of Object.entries(context.system.skills)) {
        skl.label = CONFIG.MUTANT.skills[s];
      }
    }

    // Update Encumbrance Level
    context.system.encumbrance = calculateEncumbrance(
      context.inventory,
      context.system.attributes.bra.value
    );

    // Update Actor Armor values
    if (
      context.inventory.weapon.items.filter(i => i.system.group === 'shield')
        .length > 0
    ) {
      const shields = context.inventory.weapon.items.filter(
        i => i.system.group === 'shield'
      );
      context.system.armor = C2Utility.calculateArmor(
        context.inventory.armor.items,
        shields
      );
    } else {
      context.system.armor = C2Utility.calculateArmor(
        context.inventory.armor.items,
        undefined
      );
    }

    context.xpRemaining =
      context.system.resources.xp.value - context.system.resources.xp.spent;

    context.skills = CONFIG.MUTANT.skills;

    // Create list of languages known including custom ones.
    //
    let customLanguages =
      context.actor.system.background.languages.custom || '';

    // Custom languages can be separated by semicolon characters to allow for
    // more than one custom language
    let knownLanguages = customLanguages.split(';');
    knownLanguages = knownLanguages.filter(e => e); // filter out empty strings

    const actorLanguages = this.actor.system.background.languages.value;

    /* eslint-disable no-unused-vars */
    actorLanguages.forEach((lang, index) => {
      /* eslint-enable no-unused-vars */
      if (lang !== 'custom') {
        knownLanguages.push(context.languages[lang]);
      }
    });
    knownLanguages.concat(customLanguages);

    context.knownLanguages = knownLanguages.sort();

    return context;
  }

  getMaxResolve(actorData) {
    return (
      actorData.system.attributes.wil.value +
      actorData.system.skills.dis.expertise.value -
      actorData.system.health.mental.despair +
      actorData.system.health.mental.bonus
    );
  }

  getMaxVigor(actorData) {
    return (
      actorData.system.attributes.bra.value +
      actorData.system.skills.res.expertise.value -
      actorData.system.health.physical.fatigue +
      actorData.system.health.physical.bonus
    );
  }

  /* -------------------------------------------- */

  /**
   * Organize and classify Items for Character sheets
   * @private
   */

  _prepareItems(context) {
    const inventory = {
      armor: {
        standardHeader: true,
        canCreate: true,
        label: game.i18n.localize('MUTANT.inventoryArmorHeader'),
        items: [],
      },
      weapon: {
        canCreate: true,
        standardHeader: true,
        label: game.i18n.localize('MUTANT.inventoryWeaponsHeader'),
        items: [],
      },
      kit: {
        canCreate: true,
        standardHeader: false,
        label: game.i18n.localize('MUTANT.inventoryKitsHeader'),
        items: [],
      },
      consumable: {
        canCreate: false,
        standardHeader: false,
        label: game.i18n.localize('MUTANT.inventoryConsumablesHeader'),
        items: [],
      },
      transportation: {
        canCreate: true,
        standardHeader: false,
        label: game.i18n.localize('MUTANT.transpoHeader'),
        items: [],
      },
      miscellaneous: {
        canCreate: true,
        standardHeader: true,
        label: game.i18n.localize('MUTANT.inventoryMiscHeader'),
        items: [],
      },
    };

    const talents = [];

    const sorcery = {
      enchantment: {
        label: game.i18n.localize('MUTANT.sorceryEnchantmentHeader'),
        sorcery: [],
      },
      spell: {
        label: game.i18n.localize('MUTANT.sorcerySpellHeader'),
        sorcery: [],
      },
    };

    // Actions
    const actions = {
      standard: {
        label: game.i18n.localize('MUTANT.actionsStandardActionHeader'),
        actions: [],
      },
      minor: {
        label: game.i18n.localize('MUTANT.actionsMinorActionHeader'),
        actions: [],
      },
      reaction: {
        label: game.i18n.localize('MUTANT.actionsReactionsHeader'),
        actions: [],
      },
      free: {
        label: game.i18n.localize('MUTANT.actionsFreeActionsHeader'),
        actions: [],
      },
    };

    // Read-Only Actions
    const readonlyActions = {
      interaction: {label: 'Interaction Actions', actions: []},
      defensive: {label: 'Defensive Actions', actions: []},
      offensive: {label: 'Offensive Actions', actions: []},
    };

    const readonlyEquipment = [];

    const attacks = {
      display: [],
      weapon: [],
    };

    // Pre-sort all items so that when they are filtered into their relevant
    // categories they are already sorted alphabetically (case-sensitive)
    const allItems = [];
    (context.items ?? []).forEach(item => allItems.push(item));

    allItems.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    let talentTrees = {};

    for (const i of allItems) {
      /* eslint-disable-next-line no-undef */
      i.img = i.img || DEFAULT_TOKEN;

      i.canBeStowed = true; // default for all

      // Read-Only Equipment
      if (i.type === 'armor' || i.type === 'consumable' || i.type === 'kit') {
        readonlyEquipment.push(i);
        context.hasEquipment = true;
      }

      if (i.type === 'armor' || i.type === 'weapon') {
        i.canBeEquipped = true;
        i.canBeBroken = true;
      } else {
        i.canBeEquipped = false;
        i.canBeBroken = false;
      }

      if (i.system.equipped) {
        i.isEquipped = true;
      } else {
        i.isEquipped = false;
      }

      // Filter all displays and equipped weapons into the relevant attack
      // arrays for display on the actions tab
      if (i.type === 'display' || i.type === 'weapon') {
        const action = {};
        action.imageUrl = i.img;
        action.name = i.name;
        action.type = 'attack';
        const flavor = C2Utility.getAttackDescription(i);
        action.description = flavor.description;
        action.success = flavor.success;

        action.qualities = [
          {
            name: 'attack',
            label: game.i18n.localize(CONFIG.attacks[i.type]),
          },
        ];

        if (i.type === 'weapon') {
          action.qualities.push(
            {
              name: 'weaponType',
              label: CONFIG.weaponTypes[i.system.weaponType],
            },
            {
              name: 'weapongroup',
              label: CONFIG.weaponGroups[i.system.group] ?? '',
            }
          );
        }

        i?.system?.qualities?.value?.map(quality => {
          const key = CONFIG.weaponQualities[quality] ?? quality;

          let qualityLabel = '';
          if (key.value) {
            qualityLabel = `${game.i18n.localize(key.label)}(${key.value})`;
          } else {
            qualityLabel = `${game.i18n.localize(key.label)}`;
          }

          action.qualities.push({
            name: quality,
            label: qualityLabel,
            description: CONFIG.qualitiesDescriptions[key.type] || '',
          });
        });

        action.attack = {};
        action.attack.id = i._id;
        action.attack.type = i.type;

        if (i.type === 'display' || i.isEquipped) {
          attacks[i.type].push(action);
        }
      }

      // Inventory
      if (Object.keys(inventory).includes(i.type)) {
        i.system.quantity = i.system.quantity || 0;
        i.system.encumbrance = i.system.encumbrance || 0;
        i.hasCharges = i.type === 'kit' && i.system.uses.max > 0;

        if (i.type === 'transportation') {
          i.canBeStowed = false;

          const passengerData = i.system.passengers;
          i.maxPassengersExceeded =
            passengerData.current > passengerData.capacity;

          const stowageData = i.system.stowage;

          if (stowageData.max === null) {
            i.stowageExceeded = false;
          } else {
            const stowageValue = stowageData.value || 0;
            i.stowageExceeded = stowageValue > stowageData.max;
          }
        }

        if (i.canBeStowed && i.system.stowedIn && i.system.stowedIn !== '') {
          const container = this.actor.getEmbeddedDocument(
            'Item',
            i.system.stowedIn
          );

          i.stowedInName = container.name;
        }

        inventory[i.type].items.push(i);
      } else if (i.type === 'talent') {
        const itemsTalentTree = i.system.tree.toLowerCase() || 'other';

        if (!talentTrees[itemsTalentTree]) {
          talentTrees[itemsTalentTree] = {
            label: itemsTalentTree,
            ranks: 0,
            talentCount: 0,
            talents: [],
          };
        }

        talentTrees[itemsTalentTree].talents.push(i);
        talentTrees[itemsTalentTree].ranks += i.system.rank.value;
        talentTrees[itemsTalentTree].talentCount += 1;

        const actionType = i.system.actionType || 'passive';

        if (Object.keys(actions).includes(actionType)) {
          i.talent = true;
          actions[actionType].actions.push(i);

          // Read-Only Actions
          if (i.system.actionCategory && i.system.actionCategory) {
            switch (i.system.actionCategory) {
              case 'interaction':
                readonlyActions.interaction.actions.push(i);
                context.hasInteractionActions = true;
                break;
              case 'defensive':
                readonlyActions.defensive.actions.push(i);
                context.hasDefensiveActions = true;
                break;
              // Should be offensive but throw anything else in there too
              default:
                readonlyActions.offensive.actions.push(i);
                context.hasOffensiveActions = true;
            }
          } else {
            readonlyActions.offensive.actions.push(i);
            context.hasOffensiveActions = true;
          }
        }
      } else if (i.type === 'spell') {
        sorcery[i.type].sorcery.push(i);
      } else if (i.type === 'enchantment') {
        sorcery[i.type].sorcery.push(i);
        inventory.consumable.items.push(i);
      } else if (i.type === 'transportation') {
        inventory.transportation.items.push(i);
      } else if (i.type === 'miscellaneous') {
        inventory.miscellaneous.items.push(i);
      }

      // Invalid Items
      if (i.type === 'npcaction') {
        alert('NPC Action is not a valid item for player characters');
        this.actor.deleteEmbeddedDocuments('Item', [i._id]);
      } else if (i.type === 'npcattack') {
        alert('NPC Attack is not a valid item for player characters.');
        this.actor.deleteEmbeddedDocuments('Item', [i._id]);
      }

      // Actions
      if (i.type === 'action') {
        const actionType = i.system.actionType || 'action';
        if (actionType === 'passive') {
          actions.free.actions.push(i);
        } else {
          actions[actionType].actions.push(i);

          // Read-Only Actions
          if (i.system.actionCategory) {
            switch (i.system.actionCategory) {
              case 'interaction':
                readonlyActions.interaction.actions.push(i);
                context.hasInteractionActions = true;
                break;
              case 'defensive':
                readonlyActions.defensive.actions.push(i);
                context.hasDefensiveActions = true;
                break;
              case 'offensive':
                // if (i)
                readonlyActions.offensive.actions.push(i);
                context.hasOffensiveActions = true;
                break;
              // Should be offensive but throw anything else in there too
              default:
                readonlyActions.offensive.actions.push(i);
                context.hasOffensiveActions = true;
            }
          } else {
            readonlyActions.offensive.actions.push(i);
            context.hasOffensiveActions = true;
          }
        }
      }
    }

    // Sort the discovered talent trees and add them to the talents data to
    // be stored in the context
    Object.keys(talentTrees)
      .sort()
      .forEach(talent => {
        talents.push(talentTrees[talent]);
      });

    // Assign and return
    context.actions = actions;
    context.attacks = attacks;
    context.inventory = inventory;
    context.readonlyactions = readonlyActions;
    context.readonlyEquipment = readonlyEquipment;
    context.sorcery = sorcery;
    context.talents = talents;
  }

  _adjustDespair(actorData, delta) {
    let currentMax = this.getMaxResolve(actorData);

    actorData.system.health.mental.despair += delta;
    currentMax -= delta;

    // clamp values if out of range
    if (actorData.system.health.mental.despair < 0) {
      actorData.system.health.mental.despair = 0;
    } else if (actorData.system.health.mental.value > currentMax) {
      actorData.system.health.mental.value = currentMax;
      actorData.system.health.mental.max = currentMax;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  _adjustFatigue(actorData, delta) {
    let currentMax = this.getMaxVigor(actorData);

    actorData.system.health.physical.fatigue += delta;
    currentMax -= delta;

    // clamp values if out of range
    if (actorData.system.health.physical.fatigue < 0) {
      actorData.system.health.physical.fatigue = 0;
    } else if (actorData.system.health.physical.value > currentMax) {
      actorData.system.health.physical.value = currentMax;
      actorData.system.health.physical.max = currentMax;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  _adjustResolve(actorData, delta) {
    const currentMax = this.getMaxResolve(actorData);

    actorData.system.health.mental.value += delta;

    // clamp values if out of range
    if (actorData.system.health.mental.value < 0) {
      actorData.system.health.mental.value = 0;
    } else if (actorData.system.health.mental.value > currentMax) {
      actorData.system.health.mental.value = currentMax;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  _adjustResolveBonus(actorData, delta) {
    const currentMax = this.getMaxResolve(actorData);

    // don't add a negative delta if the max value is already 0
    if (!(currentMax === 0 && delta < 0)) {
      actorData.system.health.mental.bonus += delta;

      // also apply the bonus immediately to the current health value
      actorData.system.health.mental.value += delta;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  _adjustVigor(actorData, delta) {
    const currentMax = this.getMaxVigor(actorData);

    actorData.system.health.physical.value += delta;

    // clamp values if out of range
    if (actorData.system.health.physical.value < 0) {
      actorData.system.health.physical.value = 0;
    } else if (actorData.system.health.physical.value > currentMax) {
      actorData.system.health.physical.value = currentMax;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  _adjustVigorBonus(actorData, delta) {
    const currentMax = this.getMaxVigor(actorData);

    // don't add a negative delta if the max value is already 0
    if (!(currentMax === 0 && delta < 0)) {
      actorData.system.health.physical.bonus += delta;

      // also apply the bonus immediately to the current health value
      actorData.system.health.physical.value += delta;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  _resetDespair(actorData) {
    actorData.system.health.mental.despair = 0;

    game.actors.get(actorData._id).update(actorData);
  }

  _resetFatigue(actorData) {
    actorData.system.health.physical.fatigue = 0;

    game.actors.get(actorData._id).update(actorData);
  }

  _resetResolve(actorData) {
    const currentMax = this.getMaxResolve(actorData);

    actorData.system.health.mental.value = currentMax;

    game.actors.get(actorData._id).update(actorData);
  }

  _resetResolveBonus(actorData) {
    actorData.system.health.mental.bonus = 0;

    const currentMax = this.getMaxResolve(actorData);

    // clamp the current value to the max if it is higher than the new maximum
    if (actorData.system.health.mental.value > currentMax) {
      actorData.system.health.mental.value = currentMax;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  _resetVigor(actorData) {
    const currentMax = this.getMaxVigor(actorData);

    actorData.system.health.physical.value = currentMax;

    game.actors.get(actorData._id).update(actorData);
  }

  _resetVigorBonus(actorData) {
    actorData.system.health.physical.bonus = 0;

    const currentMax = this.getMaxVigor(actorData);

    // clamp the current value to the max if it is higher than the new maximum
    if (actorData.system.health.physical.value > currentMax) {
      actorData.system.health.physical.value = currentMax;
    }

    game.actors.get(actorData._id).update(actorData);
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    html.find('.condition-value').mouseup(ev => {
      const condKey = $(ev.currentTarget)
        .parents('.sheet-condition')
        .attr('data-cond-id');
      if (ev.button === 0) {
        this.actor.addCondition(condKey);
      } else if (ev.button === 2) {
        this.actor.removeCondition(condKey);
      }
    });

    // Despair mouse controls
    html.find('.despair-tracker').mouseup(ev => {
      const actorData = duplicate(this.actor);

      if (ev.button === 0) {
        if (window.event.ctrlKey) {
          this._resetDespair(actorData);
        } else {
          this._adjustDespair(actorData, 1);
        }
      } else if (ev.button === 2) {
        this._adjustDespair(actorData, -1);
      }
    });

    html.find('.despair-tracker').on('wheel', ev => {
      const actorData = duplicate(this.actor);
      if (ev.originalEvent.deltaY < 0) {
        this._adjustDespair(actorData, 1);
      } else if (ev.originalEvent.deltaY > 0) {
        this._adjustDespair(actorData, -1);
      }
    });

    // Fatigue mouse controls
    html.find('.fatigue-tracker').mouseup(ev => {
      const actorData = duplicate(this.actor);

      if (ev.button === 0) {
        if (window.event.ctrlKey) {
          this._resetFatigue(actorData);
        } else {
          this._adjustFatigue(actorData, 1);
        }
      } else if (ev.button === 2) {
        this._adjustFatigue(actorData, -1);
      }
    });

    html.find('.fatigue-tracker').on('wheel', ev => {
      const actorData = duplicate(this.actor);
      if (ev.originalEvent.deltaY < 0) {
        this._adjustFatigue(actorData, 1);
      } else if (ev.originalEvent.deltaY > 0) {
        this._adjustFatigue(actorData, -1);
      }
    });

    // Resolve Bonus mouse controls
    html.find('.resolve-max').mouseup(ev => {
      const actorData = duplicate(this.actor);
      if (ev.button === 0) {
        if (window.event.ctrlKey) {
          this._resetResolveBonus(actorData);
        } else {
          this._adjustResolveBonus(actorData, 1);
        }
      } else if (ev.button === 2) {
        this._adjustResolveBonus(actorData, -1);
      }
    });

    html.find('.resolve-max').on('wheel', ev => {
      const actorData = duplicate(this.actor);
      if (ev.originalEvent.deltaY < 0) {
        this._adjustResolveBonus(actorData, 1);
      } else if (ev.originalEvent.deltaY > 0) {
        this._adjustResolveBonus(actorData, -1);
      }
    });

    // Resolve mouse controls
    html.find('.resolve-value').mouseup(ev => {
      const actorData = duplicate(this.actor);

      if (ev.button === 0) {
        if (window.event.ctrlKey) {
          this._resetResolve(actorData);
        } else {
          this._adjustResolve(actorData, 1);
        }
      } else if (ev.button === 2) {
        this._adjustResolve(actorData, -1);
      }
    });

    html.find('.resolve-value').on('wheel', ev => {
      const actorData = duplicate(this.actor);
      if (ev.originalEvent.deltaY < 0) {
        this._adjustResolve(actorData, 1);
      } else if (ev.originalEvent.deltaY > 0) {
        this._adjustResolve(actorData, -1);
      }
    });

    // Vigor Bonus mouse controls
    html.find('.vigor-max').on('wheel', ev => {
      const actorData = duplicate(this.actor);
      if (ev.originalEvent.deltaY < 0) {
        this._adjustVigorBonus(actorData, 1);
      } else if (ev.originalEvent.deltaY > 0) {
        this._adjustVigorBonus(actorData, -1);
      }
    });

    html.find('.vigor-max').mouseup(ev => {
      const actorData = duplicate(this.actor);
      if (ev.button === 0) {
        if (window.event.ctrlKey) {
          this._resetVigorBonus(actorData);
        } else {
          this._adjustVigorBonus(actorData, 1);
        }
      } else if (ev.button === 2) {
        this._adjustVigorBonus(actorData, -1);
      }
    });

    // Vigor mouse controls
    html.find('.vigor-value').mouseup(ev => {
      const actorData = duplicate(this.actor);

      if (ev.button === 0) {
        if (window.event.ctrlKey) {
          this._resetVigor(actorData);
        } else {
          this._adjustVigor(actorData, 1);
        }
      } else if (ev.button === 2) {
        this._adjustVigor(actorData, -1);
      }
    });

    html.find('.vigor-value').on('wheel', ev => {
      const actorData = duplicate(this.actor);
      if (ev.originalEvent.deltaY < 0) {
        this._adjustVigor(actorData, 1);
      } else if (ev.originalEvent.deltaY > 0) {
        this._adjustVigor(actorData, -1);
      }
    });

    html.find('.condition-toggle').mouseup(ev => {
      const condKey = $(ev.currentTarget)
        .parents('.sheet-condition')
        .attr('data-cond-id');

      if (
        game.mc3e.config.statusEffects.find(e => e.id === condKey).flags
          .mc3e.value === null
      ) {
        if (this.actor.hasCondition(condKey)) {
          this.actor.removeCondition(condKey);
        } else {
          this.actor.addCondition(condKey);
        }
        return;
      }

      if (ev.button === 0) {
        this.actor.addCondition(condKey);
      } else if (ev.button === 2) {
        this.actor.removeCondition(condKey);
      }
    });

    html.on('click', '.bank-momentum', () => {
      if (this.actor.isOwner || game.user.isGM) {
        if (this.actor.system.momentum <= 0) {
          ui.notifications.warn(game.i18n.localize('MUTANT.noUnbankedMomentum'));
        } else {
          new MomentumBanker(this.actor).render(true);
        }
      }
    });
  }
}

export default ActorSheetMc3eCharacter;

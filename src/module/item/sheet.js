/* eslint-disable no-unused-vars */

// import {CONFIG} from '../../scripts/config';
import TraitSelector from '../system/trait-selector';

export default class ItemSheetMc3e extends ItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options, {
      classes: options.classes.concat(['mc3e', 'item', 'sheet']),
      width: 760,
      height: 500,
      template: 'systems/mc3e/templates/items/item-sheet.html',
      resizable: false,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
    return options;
  }

  /**
   * Override header buttons to add custom ones.
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    // Add "Post to chat" button
    buttons = [
      {
        label: 'Post',
        class: 'post',
        icon: 'fas fa-comment',
        onclick: ev => this.item.postItem(ev),
      },
    ].concat(buttons);

    return buttons;
  }

  /* -------------------------------------------- */

  /**
   * Prepare item sheet data
   * Start with the base item data and extending with additional properties for rendering.
   */
  getData() {
    const data = super.getData();

    data.attributes = CONFIG.MUTANT.attributes;

    const {type} = this.item;
    mergeObject(data, {
      type,
      hasSidebar: true,
      sidebarTemplate: () =>
        `systems/mc3e/templates/items/${type}-sidebar.html`,
      hasDetails: [
        'weapon',
        'armor',
        'talent',
        'kit',
        'action',
        'display',
        'enchantment',
        'npcattack',
        'npcaction',
        'transportation',
      ].includes(type),
      detailsTemplate: () =>
        `systems/mc3e/templates/items/${type}-details.html`,
    });

    data.availability = CONFIG.MUTANT.availabilityTypes;

    if (type === 'armor') {
      data.armorQualities = CONFIG.MUTANT.armorQualities;
      data.armorTypes = CONFIG.MUTANT.armorTypes;
      data.coverageTypes = CONFIG.MUTANT.coverageTypes;
    } else if (type === 'weapon') {
      data.damageDice = CONFIG.MUTANT.damageDice;
      data.weaponDamage = CONFIG.MUTANT.weaponDamage;
      data.weaponGroups = CONFIG.MUTANT.weaponGroups;
      data.weaponQualities = CONFIG.MUTANT.weaponQualities;
      data.weaponRanges = CONFIG.MUTANT.weaponRanges;
      data.weaponReaches = CONFIG.MUTANT.weaponReaches;
      data.weaponSizes = CONFIG.MUTANT.weaponSizes;
      data.weaponTypes = CONFIG.MUTANT.weaponTypes;

      const sortedSkills = [];
      for (let skill in CONFIG.MUTANT.skills) {
        if (skill === 'oth') continue; // not sure what this is, ignore?

        sortedSkills.push({
          key: skill,
          name: CONFIG.MUTANT.skills[skill],
        });
      }

      sortedSkills.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });

      data.overrideSkills = sortedSkills;

      this._prepareQualities(CONFIG.MUTANT.weaponQualities);
    } else if (type === 'npcattack') {
      data.attackTypes = CONFIG.MUTANT.npcAttackTypes;
      data.damageDice = CONFIG.MUTANT.damageDice;
      data.damageTypes = CONFIG.MUTANT.damageTypes;
      data.hasSidebar = false;
      data.weaponDamage = CONFIG.MUTANT.weaponDamage;
      data.weaponQualities = CONFIG.MUTANT.weaponQualities;
      data.weaponRanges = CONFIG.MUTANT.weaponRanges;
      data.weaponReaches = CONFIG.MUTANT.weaponReaches;

      this._prepareQualities(CONFIG.MUTANT.weaponQualities);
    } else if (type === 'talent') {
      data.categories = CONFIG.MUTANT.actionCategories;
      data.talentActionTypes = CONFIG.MUTANT.actionTypes;
      data.talentSkills = CONFIG.MUTANT.skills;
      data.talentTypes = CONFIG.MUTANT.talentTypes;
    } else if (type === 'transportation') {
      data.animals = CONFIG.MUTANT.transpoAnimals;
      data.boatType = CONFIG.MUTANT.transpoBoatTypes;
      data.capabilities = CONFIG.MUTANT.transpoCapabilities;
      data.cartType = CONFIG.MUTANT.transpoCartTypes;
      data.categories = CONFIG.MUTANT.transpoCategories;
      data.mountType = CONFIG.MUTANT.transpoMountTypes;
    } else if (type === 'display') {
      data.displayQualities = CONFIG.MUTANT.weaponQualities;
      data.displayRanges = CONFIG.MUTANT.weaponRanges;
      data.displaySkills = CONFIG.MUTANT.skills;

      const displayDice = mergeObject(
        CONFIG.MUTANT.damageDice,
        CONFIG.MUTANT.displayDamageDice
      );

      data.damageDice = displayDice;

      this._prepareQualities(CONFIG.MUTANT.weaponQualities);
    } else if (type === 'action') {
      const actorWeapons = [];
      if (this.actor) {
        for (const i of this.actor.items) {
          if (i.type === 'weapon') actorWeapons.push(i);
        }
      }

      // TODO add function to get action img
      // const actionType = data.data.actionType.value || 'action';
      // data.item.img = this._getActionImg(actionType);
      data.actionCategories = CONFIG.MUTANT.actionCategories;
      data.actionCounts = CONFIG.MUTANT.actionCounts;
      data.actionTypes = CONFIG.MUTANT.actionTypes;
      data.weapons = actorWeapons;
      // TODO generate action tags
      // data.actionTags = [data.data.qualities.value].filter(t => !!t);
    } else if (type === 'enchantment') {
      data.blindingStrengths = CONFIG.MUTANT.enchantmentBlindingStrengths;
      data.coverageTypes = CONFIG.MUTANT.coverageTypes;
      data.damageDice = CONFIG.MUTANT.damageDice;
      data.difficulty = CONFIG.MUTANT.availabilityTypes;
      data.enchantmentEffects = CONFIG.MUTANT.weaponQualities;
      data.enchantmentStrengths = CONFIG.MUTANT.enchantmentStrengths;
      data.enchantmentTypes = CONFIG.MUTANT.enchantmentTypes;
      data.explodingItems = CONFIG.MUTANT.enchantmentExplodingItems;
      data.hasSidebar = false;
      data.ingredient = CONFIG.MUTANT.enchantmentIngredients;
      data.lotusPollenColors = CONFIG.MUTANT.lotusPollenColors;
      data.lotusPollenForms = CONFIG.MUTANT.lotusPollenForms;
      data.lotusPollenUses = CONFIG.MUTANT.lotusPollenUses;
      data.talismanTypes = CONFIG.MUTANT.enchantmentTalismanTypes;
      data.upasGlassSizes = CONFIG.MUTANT.upasGlassSizes;
      data.volatilities = CONFIG.MUTANT.enchantmentVolatilities;
    } else if (type === 'spell') {
      data.difficulty = CONFIG.MUTANT.availabilityTypes;
      data.hasSidebar = false;
    } else if (type === 'miscellaneous') {
      data.hasSidebar = true;
    } else if (type === 'npcaction') {
      data.actionTypes = CONFIG.MUTANT.npcActionTypes;
      data.hasSidebar = false;
    } else if (type === 'kit') {
      data.kitSkills = CONFIG.MUTANT.skills;
      data.kitTypes = CONFIG.MUTANT.kitTypes;
      data.uses = CONFIG.MUTANT.kitUses;
    }

    return data;
  }

  onTraitSelector(event) {
    event.preventDefault();
    const a = $(event.currentTarget);
    const options = {
      name: a.parents('label').attr('for'),
      title: a.parent().text().trim(),
      choices: CONFIG.MUTANT[a.attr('data-options')],
      hasValues: a.attr('data-has-values') === 'true',
      allowEmptyValues: a.attr('data-allow-empty-values') === 'true',
    };
    new TraitSelector(this.item, options).render(true);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // save checkbox changes
    html.find('input[type="checkbox"]').change(event => this._onSubmit(event));

    // activate trait selector
    html.find('.trait-selector').click(ev => this.onTraitSelector(ev));

    // add row to spell momentum spends
    html.find('.spend-row-add').click(ev => this.insertSpendRow(ev));

    // add row to spell alternate effects
    html.find('.alt-row-add').click(ev => this.insertAltRow(ev));

    // delete row from spell alternate effects
    html.find('.alt-row-delete').click(ev => this.deleteAltRow(ev));

    // delete row from spell momentum spends
    html.find('.spend-row-delete').click(ev => this.deleteSpendRow(ev));
  }

  _prepareQualities(traits) {
    if (traits === undefined) return;

    for (const [t, choices] of Object.entries(traits)) {
      const trait = traits[t] || {value: [], selected: []};

      if (Array.isArray(trait)) {
        trait.selected = {};
        for (const entry of trait) {
          if (typeof entry === 'object') {
            let text = `${choices[entry.type]}`;
            if (entry.value !== '') text = `${text} (${entry.value})`;
            trait.selected[entry.type] = text;
          } else {
            trait.selected[entry] = choices[entry] || `${entry}`;
          }
        }
      } else if (trait.value) {
        trait.selected = trait.value.reduce((obj, b) => {
          obj[b] = choices[b];
          return obj;
        }, {});
      }

      if (trait.custom) trait.selected.custom = trait.custom;
    }
  }

  _onChangeInput(event) {
    return this._onSubmit(event);
  }

  insertSpendRow(_event) {
    try {
      const table = document.getElementById('spellSpends');
      const itemId = this.item._id;
      const index = table.rows.length - 1;
      const key = `system.effects.momentum.${[index + 1]}`;
      this.item.update({
        id: itemId,
        [key]: {type: '', difficulty: '', effect: ''},
      });
    } catch (e) {
      alert(e);
    }
  }

  insertAltRow(_event) {
    try {
      const table = document.getElementById('altEffects');
      const itemId = this.item._id;
      const index = table.rows.length - 1;
      const key = `system.effects.alternative.${[index + 1]}`;
      this.item.update({
        id: itemId,
        [key]: {type: '', difficulty: '', effect: ''},
      });
    } catch (e) {
      alert(e);
    }
  }

  deleteAltRow(_event) {
    try {
      const table = document.getElementById('altEffects');
      const toDelete = table.rows.length - 1;
      const key = `system.effects.alternative.-=${[toDelete]}`;
      this.item.update({[key]: null});
    } catch (e) {
      alert(e);
    }
  }

  deleteSpendRow(_event) {
    try {
      const table = document.getElementById('spellSpends');
      const toDelete = table.rows.length - 1;
      const key = `system.effects.momentum.-=${[toDelete]}`;
      this.item.update({[key]: null});
    } catch (e) {
      alert(e);
    }
  }
}

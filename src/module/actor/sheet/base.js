import C2Utility from '../../../scripts/utility';
import SkillRoller from '../../apps/skill-roller';
import StowItem from '../../item/stow-item';
import TraitSelector from '../../system/trait-selector';

class ActorSheetMc3e extends ActorSheet {
  // Default non-attack action sections to be collapsed by default
  _hiddenTablesLut = {
    standard: true,
    minor: true,
    reaction: true,
    free: true,
  };

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      scrollY: [
        '.sheet-sidebar',
        '.skills-pane',
        '.character-pane',
        '.talents-pane',
        '.inventory-pane',
        '.actions-pane',
        '.sheet-body',
      ],
    });
  }

  /* eslint-disable-next-line no-unused-vars */
  async getData(options) {
    // The Actor's data
    const source = this.actor.toObject();
    const actorData = this.actor.toObject(false);

    const context = {
      actor: actorData,
      attributes: CONFIG.MUTANT.attributes,
      conditions: CONFIG.MUTANT.conditionTypes,
      config: CONFIG.DND5E,
      cssClass: this.actor.isOwner ? 'editable' : 'locked',
      editable: this.isEditable,
      hiddenTables: this._hiddenTablesLut,
      isCharacter: this.actor.type === 'character',
      isNPC: this.actor.type === 'npc',
      items: actorData.items,
      languages: CONFIG.MUTANT.languages,
      limited: this.actor.limited,
      natures: CONFIG.MUTANT.naturesTypes,
      options: this.options,
      owner: this.actor.isOwner,
      source: source.system,
      system: actorData.system,
    };

    // Update Attribute labels
    if (context.system.attributes !== undefined) {
      for (const [a, atr] of Object.entries(context.system.attributes)) {
        atr.label = CONFIG.MUTANT.attributes[a];
        atr.title = CONFIG.MUTANT.attributeTitles[a];
      }
    }

    this._prepareItems(context);
    this._addConditionData(context);

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Pad field width
    html.find('[data-wpad]').each((i, e) => {
      const text = e.tagName === 'INPUT' ? e.value : e.innerText;
      const w = (text.length * parseInt(e.getAttribute('data-wpad'), 10)) / 2;
      e.setAttribute('style', `flex: 0 0 ${w}px`);
    });

    // Item summaries
    html.find('.item .item-name h4').click(event => {
      this._onItemSummary(event);
    });

    // Hideable sections
    html.find('.hideable-items').click(event => {
      this._onHideSection(event, '.grid-container', '.item-table');
    });
    html.find('.hideable-skills').click(event => {
      this._onHideSection(event, '.grid-container', '.skill-table');
    });
    html.find('.hideable-inventory').click(event => {
      this._onHideSection(event, '.inventory-list', '.item-list');
    });

    html
      .find('[data-item-id].item .item-image-inventory')
      .click(event => this._onPostItem(event));
    html.find('item-image-inventory').click(event => this._onPostItem(event));

    // Toggle equip
    html.find('.item-toggle-equip').click(ev => {
      const f = $(ev.currentTarget);
      const itemId = f.parents('.item').attr('data-item-id');
      const active = f.hasClass('active');
      const equipped = !active;

      const item = this.actor.items.get(itemId);

      // if stowed, update stowage value in container as equipping an item
      // automatically removes it from stowage
      const stowedIn = item.system.stowedIn;
      if (stowedIn !== '') {
        let itemEncumbrance = parseInt(item.system.encumbrance) || 0;

        let originalStowageValue = this.actor.getEmbeddedDocument(
          'Item',
          stowedIn
        ).system.stowage.value;

        let newStowage = originalStowageValue - itemEncumbrance;
        newStowage = newStowage < 0 ? 0 : newStowage;

        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: stowedIn,
            'system.stowage.value': newStowage,
          },
        ]);
      }

      this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemId,
          'system.equipped': equipped,
          'system.stowedIn': '',
        },
      ]);
    });

    html.find('.item-toggle-broken').click(ev => {
      const f = $(ev.currentTarget);
      const itemId = f.parents('.item').attr('data-item-id');
      const active = f.hasClass('active');
      this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemId,
          'system.broken': !active,
        },
      ]);
    });

    html.find('.trait-selector').click(ev => this._onTraitSelector(ev));

    html.find('.item-create').click(ev => this._onItemCreate(ev));

    html.find('.item-edit').click(ev => {
      const itemId = $(ev.currentTarget).parents('.item').attr('data-item-id');
      const item = this.actor.items.get(itemId);

      return item.sheet.render(true);
    });

    html.find('.add-gold').click(() => {
      const updateActorData = {};
      updateActorData['system.resources.gold.value'] =
        this.actor.system.resources.gold.value + 1;
      this.actor.update(updateActorData);
    });

    html.find('.subtract-gold').click(() => {
      const updateActorData = {};
      if (this.actor.system.resources.gold.value <= 0) {
        return;
      }
      updateActorData['system.resources.gold.value'] =
        this.actor.system.resources.gold.value - 1;
      this.actor.update(updateActorData);
    });

    html.find('.consumable-increase').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getEmbeddedDocument('Item', itemId);
      this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemId,
          'system.uses.value': Number(item.system.uses.value) + 1,
        },
      ]);
    });

    html.find('.consumable-decrease').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getEmbeddedDocument('Item', itemId);
      if (Number(item.system.uses.value) > 0) {
        this.actor.updateEmbeddedDocuments('OwnedItem', [
          {
            _id: itemId,
            'system.uses.value': Number(item.system.uses.value) - 1,
          },
        ]);
      }
    });
    html.find('.mount-increase-pass').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getEmbeddedDocument('Item', itemId);
      this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemId,
          'system.passengers.current':
            Number(item.system.passengers.current) + 1,
        },
      ]);
    });

    html.find('.mount-decrease-pass').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getEmbeddedDocument('Item', itemId);
      if (Number(item.system.passengers.current) > 0) {
        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: itemId,
            'system.passengers.current':
              Number(item.system.passengers.current) - 1,
          },
        ]);
      }
    });
    html.find('.item-increase-quantity').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getEmbeddedDocument('Item', itemId);
      this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemId,
          'system.quantity': Number(item.system.quantity) + 1,
        },
      ]);

      // if stowed, update stowage value in container
      const stowedIn = item.system.stowedIn;
      if (stowedIn && stowedIn !== '') {
        let itemEncumbrance = parseInt(item.system.encumbrance) || 0;

        let originalStowageValue = this.actor.getEmbeddedDocument(
          'Item',
          stowedIn
        ).system.stowage.value;

        let newStowage = originalStowageValue + itemEncumbrance;

        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: stowedIn,
            'system.stowage.value': newStowage,
          },
        ]);
      }
    });

    html.find('.item-decrease-quantity').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getEmbeddedDocument('Item', itemId);
      if (Number(item.system.quantity) > 0) {
        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: itemId,
            'system.quantity': Number(item.system.quantity) - 1,
          },
        ]);

        // if stowed, update stowage value in container
        const stowedIn = item.system.stowedIn;
        if (stowedIn && stowedIn !== '') {
          let itemEncumbrance = parseInt(item.system.encumbrance) || 0;

          let originalStowageValue = this.actor.getEmbeddedDocument(
            'Item',
            stowedIn
          ).system.stowage.value;

          let newStowage = originalStowageValue - itemEncumbrance;
          newStowage = newStowage < 0 ? 0 : newStowage;

          this.actor.updateEmbeddedDocuments('Item', [
            {
              _id: stowedIn,
              'system.stowage.value': newStowage,
            },
          ]);
        }
      }
    });

    html.find('.item-decrease-uses').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');

      const item = this.actor.getEmbeddedDocument('Item', itemId);

      let uses = Number(item.system.uses.value);

      if (uses > 0) {
        uses -= 1;

        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: itemId,
            'system.uses.value': uses,
          },
        ]);
      }
    });

    html.find('.item-increase-uses').click(event => {
      const itemId = $(event.currentTarget)
        .parents('.item')
        .attr('data-item-id');
      const item = this.actor.getEmbeddedDocument('Item', itemId);

      let maxUses = parseInt(item.system.uses.max);

      if (isNaN(maxUses) || item.system.uses.value < maxUses) {
        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: itemId,
            'system.uses.value': Number(item.system.uses.value) + 1,
          },
        ]);
      }
    });

    html.find('.item-delete').click(ev => this._onItemDelete(ev));

    html.find('.item-stowage-view').mouseup(ev => {
      if (ev.button === 0) {
        this._onItemStowage(ev, 'stow');
      } else if (ev.button === 2) {
        this._onItemStowage(ev, 'unstow');
      }
    });

    html.find('.fa-dice-d20.rollable').click(event => {
      this._onRollSkillCheck(event);
    });

    html.find('.skill-name.rollable').click(event => {
      this._onRollSkillCheck(event);
    });

    html
      .find('.wounds')
      .on('click contextmenu', this._onClickWounded.bind(this));
  }

  _addConditionData(data) {
    data.conditions = duplicate(game.mc3e.config.statusEffects);
    for (const condition of data.conditions) {
      const existing = this.actor.effects.find(
        e => e.flags.core.statusId === condition.id
      );
      if (existing) {
        condition.value = existing.flags.mc3e.value;
        condition.existing = true;
      } else {
        condition.value = 0;
      }

      if (condition.flags.mc3e.value === null) {
        condition.boolean = true;
      }
    }
  }

  _executeAttack(ev, itemId) {
    ev.preventDefault();
    ev.stopPropagation();

    const weapon = this.actor.getEmbeddedDocument('Item', itemId);

    let weaponSkill = weapon.skillToUse(this.actor.type);

    this._rollSkillCheck(weaponSkill, weapon);
  }

  async _onClickWounded(event) {
    event.preventDefault();
    const field = $(event.currentTarget).parent().attr('data-target');
    const icon = $(event.currentTarget).attr('data-target');

    const actorData = duplicate(this.actor);
    const dot = getProperty(actorData, field);

    if (event.type === 'click') {
      setProperty(actorData, field, 'wounded');
      setProperty(actorData, icon, 'fas fa-skull');
    } else if (event.type === 'contextmenu') {
      if (dot === 'wounded') {
        setProperty(actorData, field, 'treated');
        setProperty(actorData, icon, 'fas fa-star-of-life');
      } else if (dot === 'treated') {
        setProperty(actorData, field, 'healed');
        setProperty(actorData, icon, 'far fa-circle');
      }
    }
    this.actor.update(actorData);
  }

  _onTraitSelector(event) {
    event.preventDefault();
    const a = $(event.currentTarget);
    const options = {
      name: a.parents('li').attr('for'),
      title: a.parent().parent().siblings('h4').text().trim(),
      choices: CONFIG.MUTANT[a.attr('data-options')],
      hasValues: a.attr('data-has-values') === 'true',
      allowEmptyValues: a.attr('data-allow-empty-values') === 'true',
      hasExceptions: a.attr('data-has-exceptions') === 'true',
    };
    new TraitSelector(this.actor, options).render(true);
  }

  _onHideSection(event, holdingParent, toHide) {
    event.preventDefault();

    const hideableTable = $(event.currentTarget)
      .parentsUntil(holdingParent)
      .next(toHide);

    const iconElement = $(event.currentTarget).find('i');

    const hideableTableId = hideableTable.attr('data-hideable-table-id');

    if (this._hiddenTablesLut[hideableTableId]) {
      this._hiddenTablesLut[hideableTableId] =
        !this._hiddenTablesLut[hideableTableId];
    } else {
      this._hiddenTablesLut[hideableTableId] = true;
    }

    if (this._hiddenTablesLut[hideableTableId]) {
      hideableTable.slideUp(200);
    } else {
      hideableTable.slideDown(200);
    }
    iconElement.toggleClass('fa-caret-down');
    iconElement.toggleClass('fa-caret-right');
  }

  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const data = duplicate(header.dataset);
    if (data.type === 'talent') {
      data.name = `New ${data.talentType.capitalize()} ${data.type.capitalize()}`;
      mergeObject(data, {'system.talentType': data.talentType});
    } else if (data.type === 'action') {
      data.name = `New ${data.actionType.capitalize()}`;
      mergeObject(data, {'system.actionType': data.actionType});
    } else if (data.type === 'npcaction') {
      if (data.actionType === 'doom') {
        data.name = `New ${game.i18n.localize('MUTANT.doomSpendHeader')}`;
      } else if (data.actionType === 'abilities') {
        data.name = `New ${game.i18n
          .localize('MUTANT.specialAbilityHeader')
          .capitalize()}`;
      }
      mergeObject(data, {'system.actionType': data.actionType});
    } else if (data.type === 'npcattack') {
      data.name = `New ${game.i18n
        .localize('MUTANT.attackHeader')
        .capitalize()}`;
      mergeObject(data, {'system.actionType': data.actionType});
    } else {
      data.name = `New ${data.type.capitalize()}`;
    }
    this.actor.createEmbeddedDocuments('Item', [data]);
  }

  _onItemDelete(event) {
    const li = $(event.currentTarget).parents('.item');
    const itemId = li.attr('data-item-id');
    const itemData = this.actor.getEmbeddedDocument('Item', itemId);
    const items = this.actor.items;

    renderTemplate(
      'systems/mc3e/templates/actors/delete-item-dialog.html',
      {name: itemData.name}
    ).then(html => {
      new Dialog({
        title: 'Confirm Deletion',
        content: html,
        buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>',
            label: 'Yes',
            callback: async () => {
              if (itemData.type === 'transportation') {
                for (const i of items) {
                  if (!i.canBeStowed) continue; // don't care about these

                  if (i.system.stowedIn === itemId) {
                    this.actor.updateEmbeddedDocuments('Item', [
                      {
                        _id: i.id,
                        'system.stowedIn': '',
                      },
                    ]);
                  }
                }
              }
              await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
              li.slideUp(200, () => this.render(false));
            },
          },
          Cancel: {
            icon: '<i class="fa fa-times"></i>',
            label: 'Cancel',
          },
        },
        default: 'Yes',
      }).render(true);
    });
  }

  async _onItemStowage(event, type) {
    const li = $(event.currentTarget).parents('.item');
    const itemId = li.attr('data-item-id');
    const item = this.actor.getEmbeddedDocument('Item', itemId);
    const context = await this.getData();
    const transports = context.inventory.transportation.items;

    if (type === 'unstow') {
      this.actor.updateEmbeddedDocuments('Item', [
        {
          _id: itemId,
          'system.equipped': false,
          'system.stowedIn': '',
        },
      ]);
    } else {
      if (transports.length > 0) {
        new StowItem({actor: this.actor, context, item}).render(true);
      } else {
        ui.notifications.warn(
          game.i18n.localize('MUTANT.stowItemNoTransportsAvailable')
        );
      }
    }
  }

  _onPostItem(event) {
    event.preventDefault();

    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.getEmbeddedDocument('Item', itemId);
    item.postItem(event);
  }

  _onRollSkillCheck(event) {
    event.preventDefault();

    const skill = $(event.currentTarget)
      .parents('.skill-entry-name')
      .attr('data-skill');

    this._rollSkillCheck(skill);
  }

  async _onItemSummary(event) {
    event.preventDefault();

    const localize = game.i18n.localize.bind(game.i18n);
    const li = $(event.currentTarget).parent().parent();
    const itemId = li.attr('data-item-id');
    const actionIndex = li.attr('data-action-index');

    let item;

    try {
      item = this.actor.getEmbeddedDocument('Item', itemId);
      if (!item.type) return;
    } catch (err) {
      return;
    }

    // Toggle summary
    if (li.hasClass('expanded')) {
      const summary = li.children('.item-summary');
      summary.slideUp(200, () => summary.remove());
    } else {
      let div;
      const chatData = await item.getChatData({secrets: this.actor.isOwner});
      if (!actionIndex) {
        div = $(
          `<div class="item-summary"><div class="item-description">${chatData.description.value}</div></div>`
        );
      } else {
        const flavor = C2Utility.getAttackDescription(item).description;
        div = $(
          `<div class="item-summary"><div class="item-description">${localize(
            flavor
          )}</div></div>`
        );
      }
      const details = $('<div class="item-details"></div>');
      const props = $('<div class="item-properties tags"></div>');

      if (chatData.itemDetails) {
        chatData.itemDetails.forEach(p => {
          const concat = `<div class="chat-item-detail"><b>${localize(
            p.label
          )}:</b> ${localize(p.detail)} </div>`;
          details.append(concat);
        });
        div.append(details);
      }
      div.append('</br>');
      if (chatData.properties) {
        chatData.properties
          .filter(p => typeof p === 'string')
          .forEach(p => {
            props.append(
              `<span class="tag tag_secondary">${localize(p)}</span>`
            );
          });
      }
      div.append(props);
      // append qualities (only style the tags if they contain description data)
      if (chatData.qualities && chatData.qualities.length) {
        chatData.qualities.forEach(p => {
          if (p.description) {
            props.append(
              `<span class="tag" title="${localize(p.description)}">${localize(
                p.label
              )}</span>`
            );
          } else {
            props.append(
              `<span class="tag tag_alt">${localize(p.label)}</span>`
            );
          }
        });
      }

      const buttons = $('<div class="item-buttons"></div>');
      switch (item.type) {
        case 'action':
          if (chatData.weapon.value) {
            if (chatData.weapon.value) {
              buttons.append(
                `<button class="tag weapon_damage" data-action="weaponDamage">${localize(
                  'MUTANT.damageRollLabel'
                )}</button>`
              );
            }
          }
          break;
        case 'weapon':
          buttons.append(
            `<button class="tag weapon_damage execute-attack" data-action="weaponAttack">${localize(
              'MUTANT.attackRollLabel'
            )}</button>`
          );
          buttons.append(
            `<button class="tag weapon_damage execute-damage" data-action="weaponDamage">${localize(
              'MUTANT.damageRollLabel'
            )}</button>`
          );
          if (item.getSoak() > 0) {
            buttons.append(
              `<button class="tag weapon_soak execute-soak" data-action="shieldSoak">${localize(
                'MUTANT.shieldSoakRollLabel'
              )}</button>`
            );
          }
          break;
        case 'display':
          buttons.append(
            `<button class="tag weapon_damage execute-attack" data-action="weaponAttack">${localize(
              'MUTANT.attackRollLabel'
            )}</button>`
          );
          buttons.append(
            `<button class="tag display_damage execute-damage" data-action="weaponDamage">${localize(
              'MUTANT.damageRollLabel'
            )}</button>`
          );
          break;
        case 'kit':
          if (chatData.hasCharges)
            buttons.append(
              `<span class="tag"><button class="consume" data-action="consume">${localize(
                'MUTANT.kitUseLabel'
              )} ${item.name}</button></span>`
            );
          break;
        case 'npcattack':
          buttons.append(
            `<button class="tag npc_damage execute-attack" data-action="npcAttack">${localize(
              'MUTANT.attackRollLabel'
            )}</button>`
          );
          buttons.append(
            `<button class="tag npc_damage execute-damage" data-action="npcDamage">${localize(
              'MUTANT.damageRollLabel'
            )}</button>`
          );
          break;
        case 'spell':
          buttons.append(
            `<button class="tag spell_attack execute-attack" data-action="spellCast">${localize(
              'MUTANT.spellCastLabel'
            )}</button>`
          );
          break;
        default:
          break;
      }

      div.append(buttons);

      buttons.find('button').click(ev => {
        ev.preventDefault();
        ev.stopPropagation();

        // which function gets called depends on the type of button stored in
        // the dataset attribute action
        switch (ev.target.dataset.action) {
          case 'consume': {
            // TODO Implement actions for all possible types of kit resource
            // consumption.
            break;
          }
          case 'weaponDamage': {
            this._executeDamage(ev, itemId);
            break;
          }
          case 'weaponAttack': {
            this._executeAttack(ev, itemId);
            break;
          }
          case 'shieldSoak': {
            const shieldItem = this.actor.items.get(itemId);
            shieldItem.triggerSoakRoll();
            break;
          }
          case 'spellCast': {
            const spell = this.actor.items.get(itemId);
            const skill = 'sor';

            this._rollSkillCheck(skill, spell);

            break;
          }
          case 'npcDamage': {
            this._executeDamage(ev, itemId);
            break;
          }
          case 'npcAttack': {
            this._executeAttack(ev, itemId);
            break;
          }
          default:
            break;
        }
      });

      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass('expanded');
  }

  async _rollSkillCheck(skill, item = null) {
    const isNpc = this.actor.type === 'npc';

    const attribute = isNpc
      ? CONFIG.expertiseAttributeMap[skill]
      : CONFIG.skillAttributeMap[skill];

    const skillData = {
      attribute,
      skill: isNpc ? null : skill,
      expertise: isNpc ? skill : null,
      item,
    };

    new SkillRoller(this.actor, skillData).render(true);
  }

  _executeDamage(ev, itemId) {
    ev.preventDefault();
    ev.stopPropagation();

    const weapon = this.actor.getEmbeddedDocument('Item', itemId);

    weapon.triggerDamageRoll();
  }
}

export default ActorSheetMc3e;

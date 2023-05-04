import ActorSheetMc3e from './base';

class ActorSheetMc3eNPC extends ActorSheetMc3e {
  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options, {
      classes: options.classes.concat(['mc3e', 'actor', 'npc-sheet']),
      width: 460,
      height: 680,
      resizable: false,
      scrollY: ['.sheet-content'],
    });
    return options;
  }

  get template() {
    const path = 'systems/mc3e/templates/actors/';
    if (!game.user.isGM && this.actor.limited)
      return `${path}readonly-npc-sheet.html`;
    return `${path}npc-sheet.html`;
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.flags = context.actor.flags;

    // Update expertise fields labels
    if (context.system.skills !== undefined) {
      for (const [s, skl] of Object.entries(context.system.skills)) {
        skl.label = CONFIG.MUTANT.expertiseFields[s];
      }
    }

    // Remove dead fields if they exist
    delete context.system.isMinion;
    delete context.system.isNemesis;
    delete context.system.isToughened;

    context.npcTypes = CONFIG.MUTANT.npcTypes;
    context.npcTraits = CONFIG.MUTANT.npcTraits;

    context.skills = CONFIG.MUTANT.expertiseFields;

    return context;
  }

  _prepareItems(context) {
    const attacks = {
      npcattack: {label: 'NPC Attack', items: []},
    };

    const actions = {
      abilities: {
        label: game.i18n.localize('MUTANT.npcActionTypes.abilities'),
        actions: [],
      },
      doom: {
        label: game.i18n.localize('MUTANT.npcActionTypes.doom'),
        actions: [],
      },
    };

    // Get Attacks
    for (const i of context.items) {
      i.img = i.img || CONST.DEFAULT_TOKEN;

      if (Object.keys(attacks).includes(i.type)) {
        if (i.type === 'npcattack') {
          let item;
          try {
            item = this.actor.getEmbeddedDocument('Item', i._id);
            i.chatData = item.getChatData({secrets: this.actor.isOwner});
          } catch (err) {
            console.error(
              `Mutant 2D20 System | NPC Sheet | Could not load item ${i.name}`
            );
          }
          attacks[i.type].items.push(i);
        }
      } else if (i.type === 'npcaction') {
        const actionType = i.system.actionType || 'npcaction';
        actions[actionType].actions.push(i);
      }

      if (i.type !== 'npcattack' && i.type !== 'npcaction') {
        // Invalid Items
        console.log('Invalid item for non-player characters!');
        this.actor.deleteEmbeddedDocuments('Item', [i.id]);
      }
    }

    context.actions = actions;
    context.attacks = attacks;
  }
}

export default ActorSheetMc3eNPC;

import Mc3eDice from './rolls';
import MomentumBanker from '../apps/momentum-banker';
import SkillRoller from '../apps/skill-roller';

export default class MutantChat {
  static async renderCombatDiceRollCard(data) {
    const template =
      'systems/mc3e/templates/chat/combat-dice-roll-card.html';
    MutantChat._renderRollCard(data, template);
  }

  static async renderDamageRollCard(data) {
    const template = 'systems/mc3e/templates/chat/damage-roll-card.html';
    MutantChat._renderRollCard(data, template);
  }

  static async renderSkillTestCard(data) {
    const template = 'systems/mc3e/templates/chat/skill-roll-card.html';
    MutantChat._renderRollCard(data, template);
  }

  static async renderSoakDiceRollCard(data) {
    const template = 'systems/mc3e/templates/chat/soak-roll-card.html';
    MutantChat._renderRollCard(data, template);
  }

  static async rerollNotification(numDice, actor) {
    let speaker;
    if (actor) {
      speaker = ChatMessage.getSpeaker({
        actor: actor,
        token: actor.token,
      });
    } else {
      speaker = ChatMessage.getSpeaker();
    }

    let html = `<h2>${game.i18n.localize('MUTANT.rerollTriggered')}</h2><div>`;

    const diceSuffix =
      numDice > 1
        ? game.i18n.localize('MUTANT.dicePlural')
        : game.i18n.localize('MUTANT.diceSingular');

    if (actor?.type === 'npc') {
      html += `${game.i18n.format('MUTANT.rerollTextNpc', {
        character: `<b>${speaker.alias}</b>`,
        diceCount: `<b>${numDice}</b>`,
      })} ${diceSuffix}.<br>`;
    } else {
      html += `${game.i18n.format('MUTANT.rerollText', {
        character: `<b>${speaker.alias}</b>`,
        diceCount: `<b>${numDice}</b>`,
      })} ${diceSuffix}.<br>`;
    }

    html += '</div>';

    const chatData = {
      speaker,
      rollMode: 'reroll',
      content: html,
    };

    ChatMessage.create(chatData);
  }

  static getMessageActor(message) {
    const tokenId = message.flags.mc3e.tokenId;

    // If the tokenId is set on the message flags, then we need to use the
    // synthetic Token Actor rather than the base Actor.
    //
    let actor;
    if (tokenId) {
      actor = game.actors.tokens[tokenId];
    } else {
      actor = game.actors.get(message.speaker.actor);
    }

    return actor;
  }

  static async _renderRollCard(data, template) {
    const html = await renderTemplate(template, data);

    let speaker;
    if (data.actor) {
      speaker = ChatMessage.getSpeaker({
        actor: data.actor,
        token: data.actor.token,
      });
    } else {
      speaker = ChatMessage.getSpeaker();
    }

    const chatData = {
      'flags.data': data,
      content: html,
      speaker,
      title: data.rollData.title,
      user: game.user.id,
    };

    ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));

    return ChatMessage.create(chatData);
  }
}

// eslint-disable-next-line no-unused-vars
Hooks.on('renderChatLog', (log, html, data) => {
  // Handle clicking on the Spend/Bank Momentum button on a successfull skill
  // test chat card
  html.on('click', '.chat-bank-momentum', ev => {
    const target = $(ev.currentTarget);
    const messageId = target.parents('.message').attr('data-message-id');
    const message = game.messages.get(messageId);

    if (message.isAuthor || game.user.isGM) {
      const actor = game.actors.get(message.speaker.actor);
      if (actor.system.momentum <= 0) {
        ui.notifications.warn(game.i18n.localize('MUTANT.noUnbankedMomentum'));
      } else {
        new MomentumBanker(actor).render(true);
      }
    }
  });

  // Handle clicking on the Attack button on a weapon chat card
  html.on('click', '.chat-execute-attack', ev => {
    ev.preventDefault();

    const target = $(ev.currentTarget);

    const messageId = target.parents('.message').attr('data-message-id');
    const message = game.messages.get(messageId);

    const actor = MutantChat.getMessageActor(message);

    const weapon = actor.getEmbeddedDocument(
      'Item',
      message.flags.mc3e.itemId
    );
    const weaponSkill = weapon.skillToUse(actor.type);

    const isNpc = actor.type === 'npc';

    const attribute = isNpc
      ? CONFIG.expertiseAttributeMap[weaponSkill]
      : CONFIG.skillAttributeMap[weaponSkill];

    const skillData = {
      attribute,
      skill: isNpc ? null : weaponSkill,
      expertise: isNpc ? weaponSkill : null,
      item: weapon,
    };

    new SkillRoller(actor, skillData).render(true);
  });

  // Handle clicking on the Damage button on a weapon chat card
  html.on('click', '.chat-execute-damage', ev => {
    ev.preventDefault();

    const target = $(ev.currentTarget);

    const messageId = target.parents('.message').attr('data-message-id');
    const message = game.messages.get(messageId);

    const actor = MutantChat.getMessageActor(message);

    const weapon = actor.getEmbeddedDocument(
      'Item',
      message.flags.mc3e.itemId
    );

    weapon.triggerDamageRoll();
  });

  // Handle clicking on the Shield Soak button on a weapon chat card
  html.on('click', '.chat-execute-soak', ev => {
    ev.preventDefault();

    const target = $(ev.currentTarget);

    const messageId = target.parents('.message').attr('data-message-id');
    const message = game.messages.get(messageId);

    const actor = MutantChat.getMessageActor(message);

    const item = actor.getEmbeddedDocument(
      'Item',
      message.flags.mc3e.itemId
    );

    item.triggerSoakRoll();
  });

  // Handle clicking on dice in chat to select for reroll
  html.on('click', '.roll-list-entry', ev => {
    const target = $(ev.currentTarget);
    const messageId = target.parents('.message').attr('data-message-id');
    const message = game.messages.get(messageId);

    const isReroll = message.flags.data.rollData.isReroll;
    const rolls = message.flags.data.results.rolls;

    if (message.isAuthor || game.user.isGM) {
      if (!isReroll) {
        const diceId = parseInt(target.attr('id'));
        const isFortuneDie = rolls[diceId].fortuneSpend;

        // Don't allow dice bought with Fortune to be re-rolled
        if (isFortuneDie) {
          return ui.notifications.warn(
            game.i18n.localize('MUTANT.YouCannotSelectFortuneDiceForReroll')
          );
        } else {
          target.toggleClass('selected');

          const newHtml = target.parents().children('.message-content').html();

          message.update({content: newHtml});
        }
      } else {
        return ui.notifications.warn(
          game.i18n.localize('MUTANT.YouCanOnlyRerollOnce')
        );
      }
    }
  });
});

Hooks.on('getChatLogEntryContext', (html, options) => {
  const canReroll = function (li) {
    let result = false;
    const message = game.messages.get(li.attr('data-message-id'));

    if (message.isAuthor || game.user.isGM) {
      const card = li.find('.roll-card');
      if (card.length && message.flags.data.rollData.isReroll === false) {
        result = true;
      }
    }
    return result;
  };

  options.push({
    name: game.i18n.localize('MUTANT.CHATOPT.triggerReroll'),
    icon: '<i class="fas fa-dice"></i>',
    condition: canReroll,
    callback: li => {
      const message = game.messages.get(li.attr('data-message-id'));
      try {
        Mc3eDice.triggerReroll(message);
      } catch (e) {
        console.log(e);
        ui.notifications.error(e);
      }
    },
  });
});

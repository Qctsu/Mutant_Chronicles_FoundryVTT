import Mc3eActor from '../actor/actor';
import Mc3eDice from '../system/rolls';
import MutantChat from '../system/chat';

export default class SkillRoller extends Application {
  constructor(actor, options) {
    super(actor, options);

    this.actor = null;

    // default data
    this.rollData = {
      actorId: null,
      assists: {
        complication: 20,
        focus: 0,
        numDice: 0,
        tn: 7,
      },
      bonus: {
        dice: 0,
        momentum: 0,
        successes: 0,
      },
      difficulty: {
        base: 1,
        display: '&nbsp;',
        increase: 0,
      },
      skill: {
        complication: 20,
        expertise: 0,
        focus: 0,
        tn: 7,
      },
      spends: {
        doom: 0,
        fortune: 0,
        momentum: 0,
      },
      fixedResults: [],
      isAssist: false,
      isReroll: false,
      item: null,
      numDice: CONFIG.BASE_2D20_DICE,
      title: 'Skill Test',
    };

    if (actor) {
      this.actor = actor;
      this.rollData.actorId = this.actor.id;

      this.attribute = options.attribute;
      this.expertise = options.expertise;
      this.skill = options.skill;
      this.rollData.item = options.item ?? null;
    }

    this.isActorRoll = this.actor ? true : false;

    this.isNpc = false;
    if (this.isActorRoll) {
      this.isNpc = this.actor.type === 'npc';
    }

    this.difficulties = [
      {
        active: false,
        tooltip: game.i18n.localize('MUTANT.skillRollDifficultyLevels.0'),
      },
      {
        active: true, // default
        tooltip: game.i18n.localize('MUTANT.skillRollDifficultyLevels.1'),
      },
      {
        active: false,
        tooltip: game.i18n.localize('MUTANT.skillRollDifficultyLevels.2'),
      },
      {
        active: false,
        tooltip: game.i18n.localize('MUTANT.skillRollDifficultyLevels.3'),
      },
      {
        active: false,
        tooltip: game.i18n.localize('MUTANT.skillRollDifficultyLevels.4'),
      },
      {
        active: false,
        tooltip: game.i18n.localize('MUTANT.skillRollDifficultyLevels.5'),
      },
    ];

    this.maxDice = CONFIG.MAX_2D20_DICE;
    let numDice = (this.baseDice = CONFIG.BASE_2D20_DICE);
    if (this.isNpc && this.actor.system.type === 'minion') {
      // Minions only roll one die and you can only purcase up to 3 dice,
      // so the maximum a minion can roll is 4 dice.
      //
      numDice = this.rollData.numDice = this.baseDice = 1;
      this.maxDice = CONFIG.MAX_2D20_DICE - 1;
    }

    this.dice = [];

    for (let i = 0; i < CONFIG.MAX_2D20_DICE; i++) {
      this.dice.push({active: i < numDice});
    }

    this.rollData.isAssist =
      numDice === CONFIG.ASSIST_2D20_DICE &&
      this.baseDice !== CONFIG.ASSIST_2D20_DICE;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['mc3e', 'skill-roller'],
      template: 'systems/mc3e/templates/apps/skill-roller.html',
      width: 320,
      height: 'auto',
      submitOnChange: false,
    });
  }

  get title() {
    const title = game.i18n.localize('MUTANT.skillRollerTitle');
    if (this.actor) {
      return `${title}: ${this.actor.name}`;
    } else {
      return title;
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    const me = this;

    // Difficulty setting buttons
    html
      .find('.skill-roller .difficulty')
      .on('click', this._onClickDifficultyButton.bind(this));

    // Dice icons
    html
      .find('.skill-roller .dice')
      .on('click', this._onClickDiceIcon.bind(this));

    // Quantity buttons
    html.find('.skill-roller .quantity-grid').each(function () {
      const spinner = $(this);
      const input = spinner.find('input[type="number"]');
      const btnUp = spinner.find('.quantity-up');
      const btnDown = spinner.find('.quantity-down');
      const quantityType = input.attr('data-quantity-type');

      const [section, type] = quantityType.split('.');

      input.on('wheel', ev => {
        ev.preventDefault();
        if (ev.originalEvent.deltaY < 0) {
          me[`_inc_${section}_${type}`](input);
        } else if (ev.originalEvent.deltaY > 0) {
          me[`_dec_${section}_${type}`](input);
        }
      });

      btnUp.click(ev => {
        ev.preventDefault();
        me[`_inc_${section}_${type}`](input);
      });

      btnDown.click(ev => {
        ev.preventDefault();
        me[`_dec_${section}_${type}`](input);
      });
    });

    // Attribute, Skill and Experise selectors
    html.find('.skill-roller select').on('change', function () {
      const selector = $(this);
      const value = selector.val();
      const selectorName = selector.attr('name');

      switch (selectorName) {
        case 'attribute':
          me._updateAttribute(value);
          break;
        case 'expertise':
          me._updateExpertise(value);
          break;
        case 'skill':
          me._updateSkill(value);
          break;
        default:
          console.error(`Unknown selector ${selectorName}`);
      }
    });

    // Submit button
    html.find('.roll-skill-check').click(this._rollSkillCheck.bind(this));
  }

  async getData() {
    this.attribute =
      this.attribute !== undefined
        ? this.attribute
        : this._sortedAttributes()[0].key;

    this.expertise =
      this.expertise !== undefined
        ? this.expertise
        : this._sortedExpertiseFields()[0].key;

    this.skill =
      this.skill !== undefined ? this.skill : this._sortedSkills()[0].key;

    const data = {
      actorData: duplicate(this.actor),
      attributes: this._sortedAttributes(),
      dice: this.dice,
      difficulties: this.difficulties,
      expertiseFields: this._sortedExpertiseFields(),
      isActorRoll: this.isActorRoll,
      isNpc: this.isNpc,
      rollData: this.rollData,
      selectedAttribute: this.attribute,
      selectedExpertise: this.expertise,
      selectedSkill: this.skill,
      skills: this._sortedSkills(),
      difficultyIncreased: false,
    };

    if (this.isActorRoll) {
      data.difficultyIncreased =
        this.actor.getDifficultyIncrease(this.attribute) > 0;
    }

    await this._updateTestDetails();

    return data;
  }

  /* ----------------------------------------------------------------------- */

  async _adjustBoughtDice(numDice) {
    // We special case things if a single dice is selected, as this is an
    // assist roll
    //
    if (this.isAssist) {
      // Assist roll.  No additional dice can be purchased for those, and no
      // bonuses apply
      //
      this.rollData.bonus.dice = 0;
      this.rollData.bonus.momentum = 0;
      this.rollData.bonus.successes = 0;
      this.rollData.spends.doom = 0;
      this.rollData.spends.fortune = 0;
      this.rollData.spends.momentum = 0;

      this.rollData.numDice = numDice;

      await this._updateAllFormValues();

      return true;
    }

    // fixedDice is the base 2d20 dice, plus any fortune and bonus d20s
    // already entered.
    //
    const fixedDice =
      this.baseDice + this.rollData.bonus.dice + this.rollData.spends.fortune;

    // If the requested amount of dice is below this then we can't adjust the
    // dice until either the number of bonus d20s and/or number of fortune
    // spent has been reduced.
    //
    if (numDice < fixedDice) return false;

    let availableToSpend = 0;
    if (this.isNpc) {
      availableToSpend = await this.actor.getAvailableDoom();
      availableToSpend -= this.rollData.spends.fortune * 3;
    } else {
      availableToSpend = await this.actor.getAvailableMomentum();
    }

    let newDoom = 0;
    let newMomentum = 0;

    // make sure we don't allocate more dice than we have available spends for
    numDice = numDice > this.maxDice ? this.maxDice : numDice;

    let diceToAllocate = numDice - fixedDice;
    let allocatedDice = 0;

    while (diceToAllocate > 0) {
      if (!this.isNpc && availableToSpend > 0) {
        availableToSpend--;
        newMomentum++;
        allocatedDice++;
      } else if (this.isNpc && availableToSpend > 0) {
        availableToSpend--;
        newDoom++;
        allocatedDice++;
      } else if (!this.isNpc) {
        newDoom++;
        allocatedDice++;
      }

      diceToAllocate--;
    }

    this.rollData.numDice = fixedDice + allocatedDice;

    this.rollData.spends.doom = newDoom;
    this.rollData.spends.momentum = newMomentum;

    this._updateAllFormValues();

    return true;
  }

  async _checkFortuneSpends() {
    const difficulty =
      this.rollData.difficulty.base + this.rollData.difficulty.increase;

    let fortuneSuccesses = this.rollData.spends.fortune;

    if (this.rollData.skill.focus > 0) {
      fortuneSuccesses *= 2;
    }

    return fortuneSuccesses >= difficulty;
  }

  async _dec_bonus_dice(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.bonus.dice--;
    this.rollData.numDice--;

    input.val(this.rollData.bonus.dice);

    await this._updateDiceIcons();
  }

  async _dec_bonus_momentum(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.bonus.momentum--;
    this._updateAllFormValues();
  }

  async _dec_bonus_successes(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.bonus.successes--;
    this._updateAllFormValues();
  }

  async _dec_skill_complication(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.skill.complication--;
    this._updateAllFormValues();
    this._updateTestDetails();
  }

  async _dec_skill_focus(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.skill.focus--;
    this._updateAllFormValues();
    this._updateTestDetails();
  }

  async _dec_skill_tn(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.skill.tn--;
    this._updateAllFormValues();
    this._updateTestDetails();
  }

  async _dec_spends_doom(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.spends.doom--;
    this.rollData.numDice--;

    input.val(this.rollData.spends.doom);

    await this._updateDiceIcons();
  }

  async _dec_spends_fortune(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.spends.fortune--;
    this.rollData.numDice--;

    input.val(this.rollData.spends.fortune);

    await this._updateDiceIcons();
  }

  async _dec_spends_momentum(input) {
    let currentValue = parseInt(input.val());

    if (currentValue === 0) return;

    this.rollData.spends.momentum--;
    this.rollData.numDice--;

    input.val(this.rollData.spends.momentum);

    await this._updateDiceIcons();
  }

  _getTestDifficulty() {
    if (this.actor) {
      [
        this.rollData.skill.tn,
        this.rollData.skill.expertise,
        this.rollData.skill.focus,
      ] = this.actor.getSkillTargetNumberAndFocus(
        this.attribute,
        this.skill,
        this.expertise
      );

      this.rollData.difficulty.increase = this.actor.getDifficultyIncrease(
        this.attribute
      );

      const untrained =
        this.rollData.skill.expertise + this.rollData.skill.focus <= 0;

      this.rollData.skill.complication = untrained ? 19 : 20;
    } else {
      this.rollData.skill.complication =
        this.element.find('#skill-complication').val() || 20;

      this.rollData.skill.expertise = 0;
      this.rollData.skill.focus = this.element.find('#skill-focus').val() || 0;
      this.rollData.skill.tn = this.element.find('#skill-tn').val() || 7;
    }

    let difficultyCalc =
      this.rollData.difficulty.base + this.rollData.difficulty.increase;

    difficultyCalc = difficultyCalc > 5 ? 5 : difficultyCalc;

    const difficulty = game.i18n.localize(
      `MUTANT.skillRollDifficultyLevels.${difficultyCalc}`
    );

    let testDetails = `TN ${this.rollData.skill.tn}, `;
    testDetails += `Focus ${this.rollData.skill.focus}, `;
    testDetails += `Comp ${this.rollData.skill.complication}`;

    if (this.isAssist) {
      const assistLabel = game.i18n.localize('MUTANT.Assist');
      testDetails = `${assistLabel}, ${testDetails}`;
    } else {
      testDetails = `${difficulty}, ${testDetails}`;
    }

    this.rollData.difficulty.display = testDetails;

    return testDetails;
  }

  async _inc_bonus_dice(input) {
    if (this.rollData.numDice < this.maxDice) {
      this.rollData.bonus.dice++;
      this.rollData.numDice++;

      input.val(this.rollData.bonus.dice);

      await this._updateDiceIcons();
    }
  }

  async _inc_bonus_momentum() {
    this.rollData.bonus.momentum++;
    this._updateAllFormValues();
  }

  async _inc_bonus_successes() {
    this.rollData.bonus.successes++;
    this._updateAllFormValues();
  }

  async _inc_skill_complication() {
    if (this.rollData.skill.complication < 20) {
      this.rollData.skill.complication++;
      this._updateAllFormValues();
      this._updateTestDetails();
    }
  }

  async _inc_skill_focus() {
    if (this.rollData.skill.focus < 5) {
      this.rollData.skill.focus++;
      this._updateAllFormValues();
      this._updateTestDetails();
    }
  }

  async _inc_skill_tn() {
    if (this.rollData.skill.tn < 20) {
      this.rollData.skill.tn++;
      this._updateAllFormValues();
      this._updateTestDetails();
    }
  }

  async _inc_spends_doom(input) {
    let currentValue = parseInt(input.val());
    let numAvailableDoom = await this.actor.getAvailableDoom();

    let doomAvailable = true; // default for non-NPCs

    if (this.isNpc) {
      // Fortune used by NPCs costs 3 Doom per Fortune
      numAvailableDoom -= this.rollData.spends.fortune * 3;
      doomAvailable = currentValue < numAvailableDoom;
    }

    if (doomAvailable && this.rollData.numDice < this.maxDice) {
      this.rollData.spends.doom++;
      this.rollData.numDice++;

      input.val(this.rollData.spends.doom);

      await this._updateDiceIcons();
    }
  }

  async _inc_spends_fortune(input) {
    let currentValue = parseInt(input.val());
    const numAvailableFortune = await this.actor.getAvailableFortune();

    const fortuneAvailable = numAvailableFortune - currentValue;

    if (fortuneAvailable > 0 && this.rollData.numDice < this.maxDice) {
      this.rollData.spends.fortune++;
      this.rollData.numDice++;

      input.val(this.rollData.spends.fortune);

      await this._updateDiceIcons();
    }
  }

  async _inc_spends_momentum(input) {
    let currentValue = parseInt(input.val());
    let numAvailableMomentum = await this.actor.getAvailableMomentum();

    const momentumAvailable = numAvailableMomentum - currentValue;

    if (momentumAvailable > 0 && this.rollData.numDice < this.maxDice) {
      this.rollData.spends.momentum++;
      this.rollData.numDice++;

      input.val(this.rollData.spends.momentum);

      await this._updateDiceIcons();
    }
  }

  async _onClickDiceIcon(event) {
    event.preventDefault();

    const diceIcon = $(event.currentTarget);

    const numDice = parseInt(diceIcon.attr('data-dice-number')) + 1;
    const prevNumDice = this.rollData.numDice;

    if (numDice === prevNumDice) return; // Nothing has changed

    if (numDice === 1) {
      this.isAssist = true;

      if (this.isActorRoll && this.isNpc) {
        this.isAssist = this.actor.system.type !== 'minion';
      }
    } else {
      this.isAssist = false;
    }

    // We only need to adjust the bought dice values if this is an Actor based
    // check.
    //
    // For the simple skill checks we do not adjust any momentum/doom/fortune,
    // and just roll the number of selected dice.
    //
    let diceAdjusted = true;
    if (this.isActorRoll) {
      diceAdjusted = await this._adjustBoughtDice(numDice, prevNumDice);
    } else {
      this.rollData.numDice = numDice;
    }

    if (diceAdjusted) {
      // Hide dice difficulty, purchasing and bonus sections if there is only
      // one dice selected, as this will be an assistance roll which can't use
      // those bonuses.
      //
      if (this.isAssist) {
        this.element.find('.extra-dice-hideable').addClass('disable-entry');
        this.element.find('.difficulty-settings').addClass('disable-entry');
      } else {
        this.element.find('.extra-dice-hideable').removeClass('disable-entry');
        this.element.find('.difficulty-settings').removeClass('disable-entry');
      }

      await this._updateTestDetails();
      await this._updateDiceIcons();
    }
  }

  async _onClickDifficultyButton(event) {
    event.preventDefault();

    const button = $(event.currentTarget);

    const difficulty = parseInt(button.attr('data-difficulty'));

    if (difficulty === this.rollData.difficulty.base) return;

    this.rollData.difficulty.base = difficulty;

    button.siblings().removeClass('active');
    button.addClass('active');

    this._updateTestDetails();
  }

  async _performRoll() {
    const results = await Mc3eDice.calculateSkillRoll(this.rollData);

    MutantChat.renderSkillTestCard({
      actor: this.actor,
      item: this.rollData.item,
      results,
      rollData: this.rollData,
      type: 'skill',
    });
  }

  async _rollSkillCheck() {
    this.close();

    if (this.actor) {
      const untrained =
        this.rollData.skill.expertise + this.rollData.skill.focus <= 0;

      this.rollData.skill.complication = untrained ? 19 : 20;

      if (this.isNpc && this.actor.system.isMob) {
        const untrainedAssist =
          this.rollData.assists.expertise + this.rollData.assists.focus <= 0;

        this.rollData.assists.complication = untrainedAssist ? 19 : 20;

        this.rollData.assists.numDice = this.actor.system.mobCount - 1;
        this.rollData.assists.tn = this.rollData.skill.tn;
        this.rollData.assists.focus = this.rollData.skill.focus;
        this.rollData.assists.expertise = this.rollData.skill.expertise;
      }
    }

    // TODO: Combine all spends into a single chat message, or just include
    // them in the Skill Roll result message?
    //
    if (this.isActorRoll) {
      if (this.isNpc) {
        Mc3eActor.buyFortune(this.actor, this.rollData.spends.fortune);

        Mc3eActor.spendDoom(this.actor, this.rollData.spends.doom);
      } else {
        Mc3eActor.payDoom(this.actor, this.rollData.spends.doom);

        Mc3eActor.spendFortune(this.actor, this.rollData.spends.fortune);

        Mc3eActor.spendMomentum(this.actor, this.rollData.spends.momentum);
      }
    }

    // TODO: If Fortune spend would mean success, then ask if they wish to roll
    // the remaining dice or not, if not set the dice to roll to 0
    const fortuneWouldSucceed = await this._checkFortuneSpends();

    if (fortuneWouldSucceed) {
      const template =
        'systems/mc3e/templates/apps/fortune-roll-dialogue.html';

      const html = await renderTemplate(template, {});

      new Dialog({
        content: html,
        title: game.i18n.localize('MUTANT.RollRemainingDice'),
        buttons: {
          yes: {
            label: game.i18n.localize('MUTANT.rollYesLabel'),
            callback: () => {
              this._performRoll();
            },
          },
          no: {
            label: game.i18n.localize('MUTANT.rollNoLabel'),
            callback: () => {
              this.rollData.numDice = 0;
              this._performRoll();
            },
          },
        },
        default: 'yes',
      }).render(true);
    } else {
      this._performRoll();
    }
  }

  _sortedAttributes() {
    return this._sortObjectsByName(CONFIG.MUTANT.attributes);
  }

  _sortedExpertiseFields() {
    return this._sortObjectsByName(CONFIG.MUTANT.expertiseFields);
  }

  _sortedSkills() {
    return this._sortObjectsByName(CONFIG.MUTANT.skills);
  }

  _sortObjectsByName(object) {
    const sortedData = [];
    for (let item in object) {
      sortedData.push({
        key: item,
        name: object[item],
      });
    }

    sortedData.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    return sortedData;
  }

  async _updateAllFormValues() {
    const me = this;

    this.element.find('.quantity-grid').each(function () {
      const spinner = $(this);
      const input = spinner.find('input[type="number"]');
      let type = input.attr('data-quantity-type');
      type = type.split('.');
      const dataSection = me.rollData[type[0]] || {};
      input.val(dataSection[type[1]]);
    });
  }

  async _updateAttribute(value) {
    this.attribute = value;

    // prettier insists on a very bizarre formatting choice for the next line
    //
    // eslint-disable-next-line prettier/prettier
    this.rollData.difficulty.increase =
      this.actor.getDifficultyIncrease(value);

    this._updateTestDetails();
  }

  async _updateDiceIcons() {
    const numDice = this.rollData.numDice;
    const me = this;

    this.element.find('.dice').each(function () {
      const icon = $(this);
      const iconNum = parseInt(icon.attr('data-dice-number'));

      icon.removeClass('fortune selected unselected');

      if (iconNum < me.rollData.spends.fortune) {
        icon.addClass('fortune');
        icon.html('1');
      } else if (iconNum < numDice) {
        icon.addClass('selected');
        icon.html('?');
      } else {
        icon.addClass('unselected');
        icon.html('&nbsp;');
      }
    });
  }

  async _updateExpertise(value) {
    this.expertise = value;
    this._updateTestDetails();
  }

  async _updateSkill(value) {
    this.skill = value;
    this._updateTestDetails();
  }

  async _updateSkillDescription() {
    if (this.isActorRoll) {
      const attribute = CONFIG.attributes[this.attribute];

      let skill = CONFIG.skills[this.skill];
      if (this.isNpc) {
        skill = CONFIG.expertiseFields[this.expertise];
      }

      this.rollData.title = `${attribute} / ${skill}`;
    }
  }

  async _updateTestDetails() {
    const text = this._getTestDifficulty();
    await this._updateSkillDescription();
    this.element.find('.test-details').html(text);

    let difficultyText = game.i18n.localize(
      'MUTANT.skillRollDifficultyIncreased'
    );

    if (this.rollData.difficulty.increase > 0) {
      // *difficulty increased due to wounds/traumas
      this.element.find('.difficulty-increased').html(difficultyText);
    } else {
      this.element.find('.difficulty-increased').html('&nbsp;');
    }
  }
}

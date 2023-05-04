import MutantChat from '../system/chat';
import Mc3eDice from '../system/rolls';

export default class SoakDiceRoller extends Application {
  constructor(actor, options) {
    super(actor, options);

    this.actor = null;

    this.rollData = Mc3eDice.getDefaultCombatDiceRollOptions();

    if (actor) {
      this.actor = actor;
      this.rollData.actorId = this.actor.id;
    }

    this.isActorRoll = this.actor ? true : false;

    this.isNpc = false;
    this.isPc = false;

    if (this.isActorRoll) {
      this.isNpc = this.actor.type === 'npc';
      this.isPc = !this.isNpc;
    }

    this.soakType = options?.type || 'cover';
    this.rollData.itemName = options?.itemName || null;
    this.rollData.base.numDice = options?.soak || 1;

    this.presetTitle = null;

    this.rollData.title = game.i18n.localize('MUTANT.SoakDice');

    this.coverPresets = [
      {
        active: false,
        name: game.i18n.localize('MUTANT.LightCover'),
        numDice: 2,
        tooltip: game.i18n.localize('MUTANT.LightCoverTooltip'),
      },
      {
        active: false,
        name: game.i18n.localize('MUTANT.HeavyCover'),
        numDice: 4,
        tooltip: game.i18n.localize('MUTANT.HeavyCoverTooltip'),
      },
    ];

    this.moralePresets = [
      {
        active: false,
        name: game.i18n.localize('MUTANT.MinorMorale'),
        numDice: 2,
        tooltip: game.i18n.localize('MUTANT.MinorMoraleTooltip'),
      },
      {
        active: false,
        name: game.i18n.localize('MUTANT.MajorMorale'),
        numDice: 4,
        tooltip: game.i18n.localize('MUTANT.MajorMoraleTooltip'),
      },
    ];

    this.soakTypes = [
      {
        active: this.soakType === 'cover' ? true : false,
        name: game.i18n.localize('MUTANT.soakCover'),
        value: 'cover',
        tooltip: game.i18n.localize('MUTANT.LightCoverTooltip'),
      },
      {
        active: this.soakType === 'morale' ? true : false,
        name: game.i18n.localize('MUTANT.soakMorale'),
        value: 'morale',
        tooltip: game.i18n.localize('MUTANT.HeavyCoverTooltip'),
      },
    ];
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['mc3e', 'soak-dice-roller'],
      template: 'systems/mc3e/templates/apps/soak-dice-roller.html',
      width: 200,
      height: 'auto',
      submitOnChange: false,
    });
  }

  get title() {
    const title = game.i18n.localize('MUTANT.SoakDice');
    if (this.actor) {
      return `${title}: ${this.actor.name}`;
    } else {
      return title;
    }
  }

  activateListeners(html) {
    super.activateListeners(html);
    const me = this;

    // Submit button
    html.find('.roll-dice').click(this._onSubmit.bind(this));

    // Soak Preset buttons
    html
      .find('.soak-dice-roller .soak-preset')
      .on('click', this._onClickPresetButton.bind(this));

    // Soak Type buttons
    html
      .find('.soak-dice-roller .soak-type')
      .on('click', this._onClickTypeButton.bind(this));

    // Quantity buttons
    html.find('.soak-dice-roller .quantity-grid').each(function () {
      const spinner = $(this);
      const input = spinner.find('input[type="number"]');
      const btnUp = spinner.find('.quantity-up');
      const btnDown = spinner.find('.quantity-down');
      const quantityType = input.attr('data-quantity-type');

      const [section, type] = quantityType.split('.');

      input.on('wheel', ev => {
        ev.preventDefault();
        me._clearPresets();
        if (ev.originalEvent.deltaY < 0) {
          me[`_inc_${section}_${type}`](input);
        } else if (ev.originalEvent.deltaY > 0) {
          me[`_dec_${section}_${type}`](input);
        }
      });

      btnUp.click(ev => {
        ev.preventDefault();
        me._clearPresets();
        me[`_inc_${section}_${type}`](input);
      });

      btnDown.click(ev => {
        ev.preventDefault();
        me._clearPresets();
        me[`_dec_${section}_${type}`](input);
      });
    });
  }

  async getData() {
    const data = {
      actorData: duplicate(this.actor),
      coverPresets: this.coverPresets,
      isActorRoll: this.isActorRoll,
      isNpc: this.isNpc,
      isPc: this.isPc,
      itemName: this.rollData.itemName,
      moralePresets: this.moralePresets,
      rollData: this.rollData,
      soakType: this.soakType,
      soakTypes: this.soakTypes,
    };

    return data;
  }

  async _dec_base_numDice(input) {
    let currentValue = parseInt(input.val());
    currentValue--;

    if (currentValue < 1) currentValue = 1;

    this.rollData.base.numDice = currentValue;

    input.val(this.rollData.base.numDice);
  }

  async _inc_base_numDice(input) {
    this.rollData.base.numDice++;

    input.val(this.rollData.base.numDice);
  }

  async _clearPresets() {
    this.element.find('.soak-dice-roller .soak-preset').removeClass('active');
    this.presetTitle = null;

    this._updateTitle();
  }

  async _onClickPresetButton(event) {
    event.preventDefault();

    const button = $(event.target);

    const preset = parseInt(button.attr('data-preset'));

    if (!event.target.classList.contains('active')) {
      this.rollData.base.numDice = preset;
      this._updateAllFormValues();
      this.presetTitle = event.target.innerText;
    } else {
      this.presetTitle = null;
    }

    this.element.find('.soak-dice-roller .soak-preset').removeClass('active');
    button.toggleClass('active');
  }

  async _onClickTypeButton(event) {
    event.preventDefault();

    const button = $(event.target);

    const soakType = button.attr('data-soak-type');

    if (soakType === this.soakType) return;

    this.soakType = soakType;

    this.element.find('.cover-presets').toggle();
    this.element.find('.morale-presets').toggle();

    this.element.find('.soak-dice-roller .soak-preset').removeClass('active');

    button.siblings().removeClass('active');
    button.addClass('active');
  }

  async _onSubmit() {
    this._updateTitle();
    this._rollDice();
  }

  async _rollDice() {
    this.close();

    this.rollData.numDice =
      this.rollData.base.numDice + this.rollData.bonus.attribute;

    // Do the actual dice rolls
    const results = await Mc3eDice.calculateCombatDiceRoll(this.rollData);

    this._showResults(results);
  }

  async _showResults(results) {
    MutantChat.renderSoakDiceRollCard({
      actor: this.actor,
      item: this.rollData.item,
      results,
      rollData: this.rollData,
      type: 'soak',
    });
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

  async _updateTitle() {
    let soakType = null;

    if (this.soakType === 'cover') {
      soakType = game.i18n.localize('MUTANT.soakCover');
    } else if (this.soakType === 'morale') {
      soakType = game.i18n.localize('MUTANT.soakMorale');
    }

    let presetTitle = this.presetTitle;
    const soakDiceTitle = game.i18n.localize('MUTANT.Soak');

    let title = `${soakType}`;
    if (presetTitle) {
      title = `${presetTitle} ${title}`;
    }

    this.rollData.title = `${title} ${soakDiceTitle}`;
  }
}

/**
 * Counter Application for 2d20 metacurrencies
 * @type {FormApplication}
 */
export default class Counter extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'counter';
    options.classes = ['mc3e'];
    options.template = 'systems/mc3e/templates/apps/counter.html';
    options.width = 'auto';
    options.height = 300;
    options.popOut = false;
    return options;
  }

  /* -------------------------------------------- */
  /**
   * Provide data to the HTML template for rendering
   * @type {Object}
   */
  getData() {
    const data = super.getData();
    data.momentum = game.settings.get('mc3e', 'momentum');
    data.doom = game.settings.get('mc3e', 'doom');
    data.canEdit =
      game.user.isGM || game.settings.get('mc3e', 'playerCounterEdit');

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Call setCounter when input is used
    html.find('input').change(ev => {
      const type = $(ev.currentTarget).parents('.counter').attr('data-type');
      Counter.setCounter(ev.target.value, type);
    });

    // Call changeCounter when +/- is used
    html.find('.incr,.decr').click(ev => {
      const type = $(ev.currentTarget).parents('.counter').attr('data-type');
      const multiplier = $(ev.currentTarget).hasClass('incr') ? 1 : -1;
      Counter.changeCounter(1 * multiplier, type);
    });
  }

  // ************************* STATIC FUNCTIONS ***************************

  /**
   * Set the counter of (type) to (value)
   * @param value Value to set counter to
   * @param type  Type of counter, "momentum" or "doom"
   */
  static async setCounter(value, type) {
    Counter.checkCounterUpdate(value, type);
    value = Math.round(value);

    if (!game.user.isGM) {
      game.socket.emit('system.mc3e', {
        type: 'setCounter',
        payload: {value, type},
      });
      return;
    }

    if (value > 6 && type === 'momentum') {
      await game.settings.set('mc3e', type, 6);
      CONFIG.MUTANT.Counter.render(true);
    } else if (value < 0) {
      await game.settings.set('mc3e', type, 0);
      CONFIG.MUTANT.Counter.render(true);
    } else {
      await game.settings.set('mc3e', type, value);
      CONFIG.MUTANT.Counter.render(true);
    }

    // Emit socket event for users to rerender their counters
    game.socket.emit('system.mc3e', {type: 'updateCounter'});
  }

  /**
   * Change the counter of (type) by (value)
   * @param diff How much to change the counter
   * @param type  Type of counter, "momentum" or "doom"
   */
  static async changeCounter(diff, type) {
    Counter.checkCounterUpdate(diff, type);
    let value = game.settings.get('mc3e', type);
    if (value + diff > 6 && type === 'momentum') {
      Counter.setCounter(6, type);
    } else if (value + diff < 0) {
      Counter.setCounter(0, type);
    } else {
      value += diff;
      Counter.setCounter(value, type);
    }
  }

  // Check user entry. Rerender if error is detected to reset to the correct value
  static checkCounterUpdate(value, type) {
    const updateError = {
      counter: 'Mutant 2D20 | Error updating Counter: Invalid Counter Type',
      value: 'Mutant 2D20 | Error updating Counter: Invalid Value Type',
    };

    if (type !== 'doom' && type !== 'momentum') {
      ui.notifications.error('Error updating Counter: Invalid Counter Type');
      CONFIG.MUTANT.Counter.render(true);
      throw updateError.counter;
    }

    if (Number.isNaN(value)) {
      ui.notifications.error('Error updating Counter: Invalid Value Type');
      CONFIG.MUTANT.Counter.render(true);
      throw updateError.value;
    }
  }
}

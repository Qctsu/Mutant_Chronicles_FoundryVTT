import {MigrationBase} from '../base';

export class Update_22120601 extends MigrationBase {
  static version = 0.22120601;

  async updateItem(item) {
    if (item.type === 'spell' || item.type === 'enchantment') {
      // Strip out any leading or trailing spaces for the effects on these
      // items caused by the template textarea issue
      //
      const regex = /^\s+|\s+$/g;

      for (const [, value] of Object.entries(item.system.effects.momentum)) {
        value.difficulty = value.difficulty.replace(regex, '');
        value.effect = value.effect.replace(regex, '');
        value.spend = value.spend.replace(regex, '');
        value.type = value.type.replace(regex, '');
      }

      for (const [, value] of Object.entries(item.system.effects.alternative)) {
        value.difficulty = value.difficulty.replace(regex, '');
        value.effect = value.effect.replace(regex, '');
        value.spend = value.spend.replace(regex, '');
        value.type = value.type.replace(regex, '');
      }
    }
  }
}

import {MigrationBase} from '../base';

export class Update_031421 extends MigrationBase {
  static version = 0.031421;

  async updateItem(item) {
    if (item.type === 'talent' && item.system.skill) {
      console.log(
        'Mc3e System | Found Talent item from previous schema. Migrating item schema.'
      );
      if (!item.system.tree) {
        item.system.tree =
          game.i18n.localize(CONFIG.skills[item.system.skill]) || '';
      }
      console.log('Mc3e System | Removing unused field in item schema.');
      delete item.system.skill;
    }
  }
}

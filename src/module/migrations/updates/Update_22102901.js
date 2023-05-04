import {MigrationBase} from '../base';

export class Update_22102901 extends MigrationBase {
  static version = 0.22102901;

  async updateItem(item) {
    if (item.system.encumbrance === '1each') {
      console.log(
        'Mc3e System | Found Item using old "1each" encumbrance value. Migrating Item.'
      );
      item.system.encumbrance = 1;
    }
  }
}

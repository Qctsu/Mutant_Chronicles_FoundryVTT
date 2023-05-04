import {MigrationBase} from '../base';

export class Update_22122701 extends MigrationBase {
  static version = 0.22122701;

  async updateItem(item) {
    if (item.type === 'kit') {
      item.system.quantity = 1;
    }
  }
}

import {MigrationBase} from '../base';

export class Update_22040301 extends MigrationBase {
  static version = 0.22040301;

  async updateItem(item) {
    if (item.type === 'transportation') {
      if (
        typeof item.system.stowage === 'number' ||
        typeof item.system.stowage === 'string'
      ) {
        console.log(
          'Mc3e System | Found Item using old stowage schema. Migrating Item schema.'
        );

        let currentStowage = parseInt(item.system.stowage);
        currentStowage = isNaN(currentStowage) ? 0 : currentStowage;

        item.system.stowage = {
          max: currentStowage,
          value: currentStowage,
        };
      }
    }
  }
}

import {MigrationBase} from '../base';

export class Update_220106 extends MigrationBase {
  static version = 0.220106;

  async updateActor(actor) {
    if (
      !actor.system.health.physical.bonus ||
      !actor.system.health.mental.bonus
    ) {
      console.log(
        'Mc3e System | Found Actor missing health bonus from previous schema. Migrating actor schema.'
      );
      actor.system.health.physical.bonus = 0;
      actor.system.health.mental.bonus = 0;
    }
  }
}

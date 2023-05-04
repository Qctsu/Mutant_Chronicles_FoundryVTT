import {MigrationBase} from '../base';

export class Update_22110501 extends MigrationBase {
  static version = 0.22110501;

  async updateActor(actor) {
    if (actor.system.health.mental.traumas.current) {
      actor.system.health.mental.traumas.value =
        actor.system.health.mental.traumas.current;

      actor.system.health.mental.traumas.current = null;
      actor.system.health.mental.traumas.treated = null;

      // actor['system.health.mental.traumas.-=treated'] = null;

      console.log('Mc3e System | Migrating Actor mental health');
    }
  }
}

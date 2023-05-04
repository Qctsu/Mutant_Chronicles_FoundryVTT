import {MigrationBase} from '../base';

export class Update_22081201 extends MigrationBase {
  static version = 0.22081201;

  async updateActor(actor) {
    if (actor.type === 'npc') {
      delete actor.system.isMinion;
      delete actor.system.isToughened;
      delete actor.system.isNemesis;

      const categories = actor.system.categories.value;

      if (categories.includes('minion')) {
        actor.system.type = 'minion';
      }
      if (categories.includes('toughened')) {
        actor.system.type = 'toughened';
      }
      if (categories.includes('nemesis')) {
        actor.system.type = 'nemesis';
      }

      const newCategories = [];
      for (const category of actor.system.categories.value) {
        if (
          category !== 'minion' &&
          category !== 'toughened' &&
          category !== 'nemesis'
        ) {
          newCategories.push(category);
        }
      }

      actor.system.categories.value = newCategories;
    }
  }
}

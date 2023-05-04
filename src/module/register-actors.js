import ActorSheetMc3eCharacter from './actor/sheet/character';
import ActorSheetMc3eNPC from './actor/sheet/npc';

function registerActors() {
  Actors.unregisterSheet('core', ActorSheet);

  // Register Character Sheet
  Actors.registerSheet('mc3e', ActorSheetMc3eCharacter, {
    types: ['character'],
    makeDefault: true,
  });

  Actors.registerSheet('mc3e', ActorSheetMc3eNPC, {
    types: ['npc'],
    makeDefault: true,
  });
}

export default registerActors;

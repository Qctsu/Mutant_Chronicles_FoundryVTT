export default function () {
  const templatePaths = [
    'systems/mc3e/templates/actors/character-sheet.html',
    'systems/mc3e/templates/actors/delete-item-dialog.html',
    'systems/mc3e/templates/actors/main/actor-armor.html',
    'systems/mc3e/templates/actors/main/actor-details.html',
    'systems/mc3e/templates/actors/main/actor-header.html',
    'systems/mc3e/templates/actors/main/actor-health.html',
    'systems/mc3e/templates/actors/npc/actions.html',
    'systems/mc3e/templates/actors/npc/attacks.html',
    'systems/mc3e/templates/actors/npc/attributes.html',
    'systems/mc3e/templates/actors/npc/fields.html',
    'systems/mc3e/templates/actors/npc/health.html',
    'systems/mc3e/templates/actors/npc/mob.html',
    'systems/mc3e/templates/actors/npc/type.html',
    'systems/mc3e/templates/actors/stow-item.html',
    'systems/mc3e/templates/actors/tabs/actor-actions.html',
    'systems/mc3e/templates/actors/tabs/actor-biography.html',
    'systems/mc3e/templates/actors/tabs/actor-character.html',
    'systems/mc3e/templates/actors/tabs/actor-inventory.html',
    'systems/mc3e/templates/actors/tabs/actor-notes.html',
    'systems/mc3e/templates/actors/tabs/actor-skills.html',
    'systems/mc3e/templates/actors/tabs/actor-spells.html',
    'systems/mc3e/templates/actors/tabs/actor-talents.html',
    'systems/mc3e/templates/actors/tabs/item-line.html',
    'systems/mc3e/templates/actors/tabs/npcattack-line.html',
    'systems/mc3e/templates/apps/fortune-roll-dialogue.html',
    'systems/mc3e/templates/items/action-details.html',
    'systems/mc3e/templates/items/action-sidebar.html',
    'systems/mc3e/templates/items/armor-details.html',
    'systems/mc3e/templates/items/armor-sidebar.html',
    'systems/mc3e/templates/items/display-details.html',
    'systems/mc3e/templates/items/display-sidebar.html',
    'systems/mc3e/templates/items/enchantment-details.html',
    'systems/mc3e/templates/items/item-sheet.html',
    'systems/mc3e/templates/items/kit-details.html',
    'systems/mc3e/templates/items/kit-sidebar.html',
    'systems/mc3e/templates/items/miscellaneous-sidebar.html',
    'systems/mc3e/templates/items/npcaction-details.html',
    'systems/mc3e/templates/items/npcattack-details.html',
    'systems/mc3e/templates/items/npcattack-sidebar.html',
    'systems/mc3e/templates/items/spell-sheet.html',
    'systems/mc3e/templates/items/talent-details.html',
    'systems/mc3e/templates/items/talent-sidebar.html',
    'systems/mc3e/templates/items/transportation-details.html',
    'systems/mc3e/templates/items/transportation-sidebar.html',
    'systems/mc3e/templates/items/weapon-details.html',
    'systems/mc3e/templates/items/weapon-sidebar.html',
  ];

  return loadTemplates(templatePaths);
}
/***************************************************************
 *
 * This macro can be used to trigger damage rolls.
 *
 * When a GM uses this macro, the damage roll dialog will be
 * generic if they have no tokens selected.  Otherwise the
 * damage roll will use the selected token's Actor data.
 *
 * When a player uses this macro, the skill check is tied to
 * the Actor that they own and control.
 *
 * @param {string} [weaponName] Name of the Weapon to use
 *                              (optional)
 *
 * @example
 * game.mc3e.macros.damageRoll();
 *
 * @example
 * game.mc3e.macros.damageRoll("Cutlass");
 *
 * NOTE: If an weaponName is specified, this item must be owned
 * by the Actor selected, or if no Actor is selected it must
 * exist within the World.
 *
 * Reloads can only be used if both an Actor is selected and
 * the Weapon is ranged.
 *
 * When an item is specified, the Combat Dice value specified
 * on the Weapon is pre-populated in the Combat Dice box and
 * cannot be modified.  Additional dice required in this case
 * must be added using the "Other" box.
 **************************************************************/

game.mc3e.macros.damageRoll();

/***************************************************************
 * This macro can be used to roll an arbitrary amount of Combat
 * Dice for a Morale check and includes selectable presets
 * supported by the core rules.
 *
 * @param {string} [itemName] Name of the item being used for
 *                            the Soak roll.
 *
 * @param {number} [soak]     The amount of Combat Dice of Soak
 *                            provided by the item.
 *
 * @example
 * game.mc3e.macros.moraleSoakDiceRoll();
 *
 * @example
 * game.mc3e.macros.moraleSoakDiceRoll("Totem", 3);
 *
 * NOTE: This macro is basically a wrapper around the
 * soakDiceRoll macro.
 **************************************************************/

game.mc3e.macros.moraleSoakDiceRoll();

/***************************************************************
 * This macro can be used to roll an arbitrary amount of Combat
 * Dice for either Cover or Moral Soak Roll.  It includes a few
 * selectable presets supported by the core rules.
 *
 * @param {string} [type]     The type of Soak roll to set by
 *                            default in the interface.  Can
 *                            be either 'cover' or 'morale'
 *                            (optional, defaults to 'cover')
 *
 * @param {string} [itemName] Name of the item being used for
 *                            the Soak roll.
 *
 * @param {number} [soak]     The amount of Combat Dice of Soak
 *                            provided by the item.
 *
 * @example
 * game.mc3e.macros.soakDiceRoll();
 *
 * @example
 * game.mc3e.macros.soakDiceRoll("cover", "Big Shield", 3);
 **************************************************************/

game.mc3e.macros.soakDiceRoll();

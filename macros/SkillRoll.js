/***************************************************************
 *
 * This macro can be used to trigger skill test rolls.
 *
 * When a GM uses this macro, they will be shown a simple skill
 * check dialog if they have no tokens selected.  Otherwise the
 * skill roll will use the selected token's Actor data.
 *
 * When a player uses this macro, the skill check is tied to
 * the Actor that they own and control.
 *
 * @param {string} [skillName] Name of the skill/expertise to
 *                             use (optional)
 *
 * @example
 * game.mc3e.macros.skillRoll();
 *
 * @example
 * game.mc3e.macros.skillRoll("Discipline");
 *
 **************************************************************/

game.mc3e.macros.skillRoll();

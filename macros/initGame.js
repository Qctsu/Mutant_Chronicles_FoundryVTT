/***************************************************************
 * This macro can be used to perform the following housekeeping
 * tasks at the start of a game:
 *
 *    - Reset every player characters' Vigor, Resolve and
 *      Fortune to their maximum/starting values.
 *
 *    - Clears any left over personal momentum for every
 *      player character.
 *
 *    - Sets the player's shared Momentum pool to zero.
 *
 *    - Sets the Doom pool to the sum of all players'
 *      starting Fortune.
 *
 * NOTE: Only users with the Game Master user role can run this
 * macro.
 **************************************************************/

game.mc3e.macros.initGame();

/***************************************************************
 * This macro can be used to perform the following housekeeping
 * tasks when you start a new scene:
 *
 *    - Reset every player characters' Vigor and Resolve to
 *      their current maximum.
 *
 *    - Clears any left over personal momentum for every
 *      player.
 *
 *    - Reduces the players' shared Momentum pool by one.
 *
 * NOTE: Only users with the Game Master user role can run this
 * macro.
 **************************************************************/

game.mc3e.macros.newScene();

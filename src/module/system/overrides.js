/* eslint-disable no-unused-vars */
export default function () {
  TokenHUD.prototype._onToggleEffect = function (
    event,
    {overlay = false} = {}
  ) {
    event.preventDefault();
    const img = event.currentTarget;
    const effect =
      img.dataset.statusId && this.object.actor
        ? CONFIG.statusEffects.find(e => e.id === img.dataset.statusId)
        : img.getAttribute('src');
    if (event.button === 0) return this.object.incrementCondition(effect);
    if (event.button === 2) return this.object.decrementCondition(effect);
  };

  Token.prototype.incrementCondition = async function (
    effect,
    {active, overlay = false} = {}
  ) {
    const existing = this.actor.effects.find(
      e => e.flags.core.statusId === effect.id
    );

    if (
      !existing ||
      Number.isNumeric(getProperty(existing, 'flags.mc3e.value'))
    )
      this.actor.addCondition(effect.id);
    else if (existing)
      // Not numeric, toggle if existing
      this.actor.removeCondition(effect.id);

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  };

  Token.prototype.decrementCondition = async function (
    effect,
    {active, overlay = false} = {}
  ) {
    this.actor.removeCondition(effect.id);

    // Update the Token HUD
    if (this.hasActiveHUD) canvas.tokens.hud.refreshStatusIcons();
    return active;
  };
}

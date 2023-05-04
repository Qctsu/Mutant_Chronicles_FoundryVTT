export default function () {
  game.settings.register('mc3e', 'worldSchemaVersion', {
    name: 'Actor Schema Version',
    hint: "Records the schema version for Mc3e system actor data. (don't modify this unless you know what you are doing)",
    scope: 'world',
    config: true,
    default: 0,
    type: Number,
  });
  game.settings.register('mc3e', 'defaultTokenSettings', {
    name: 'Default Token Settings',
    hint: 'Automatically set advised token settings to newly created Actors.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register('mc3e', 'defaultTokenSettingsBar', {
    name: 'Default Token Bar display',
    hint: "The setting for the default token's bar display",
    scope: 'world',
    config: true,
    default: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    type: Number,
    choices: {
      [CONST.TOKEN_DISPLAY_MODES.NONE]: 'Never Displayed',
      [CONST.TOKEN_DISPLAY_MODES.CONTROL]: 'When Controlled',
      [CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER]: 'Hovered by Owner',
      [CONST.TOKEN_DISPLAY_MODES.HOVER]: 'Hovered by Anyone',
      [CONST.TOKEN_DISPLAY_MODES.OWNER]: 'Always for Owner',
      [CONST.TOKEN_DISPLAY_MODES.ALWAYS]: 'Always for Anyone',
    },
  });
  game.settings.register('mc3e', 'defaultTokenSettingsName', {
    name: 'Default Token Name display',
    hint: "The setting for the default token's name display",
    scope: 'world',
    config: true,
    default: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    type: Number,
    choices: {
      [CONST.TOKEN_DISPLAY_MODES.NONE]: 'Never Displayed',
      [CONST.TOKEN_DISPLAY_MODES.CONTROL]: 'When Controlled',
      [CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER]: 'Hovered by Owner',
      [CONST.TOKEN_DISPLAY_MODES.HOVER]: 'Hovered by Anyone',
      [CONST.TOKEN_DISPLAY_MODES.OWNER]: 'Always for Owner',
      [CONST.TOKEN_DISPLAY_MODES.ALWAYS]: 'Always for Anyone',
    },
  });

  game.settings.register('mc3e', 'playerCounterEdit', {
    name: 'Allow Players To Edit Counters',
    hint: 'Players will be able to change counter values manually.',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
  game.settings.register('mc3e', 'momentum', {
    name: 'Momentum',
    scope: 'world',
    config: false,
    default: 0,
    type: Number,
  });
  game.settings.register('mc3e', 'doom', {
    name: 'Doom',
    scope: 'world',
    config: false,
    default: 0,
    type: Number,
  });
}

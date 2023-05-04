/* eslint-disable no-shadow */

export const CONFIG = {};

CONFIG.attributes = {
  bra: 'MUTANT.attributes.bra',
  agi: 'MUTANT.attributes.agi',
  awa: 'MUTANT.attributes.awa',
  coo: 'MUTANT.attributes.coo',
  int: 'MUTANT.attributes.int',
  wil: 'MUTANT.attributes.wil',
  per: 'MUTANT.attributes.per',
};

CONFIG.attributeTitles = {
  bra: 'MUTANT.attributeTitles.bra',
  agi: 'MUTANT.attributeTitles.agi',
  awa: 'MUTANT.attributeTitles.awa',
  coo: 'MUTANT.attributeTitles.coo',
  int: 'MUTANT.attributeTitles.int',
  wil: 'MUTANT.attributeTitles.wil',
  per: 'MUTANT.attributeTitles.per',
};

CONFIG.ASSIST_2D20_DICE = 1;
CONFIG.BASE_2D20_DICE = 2;
CONFIG.MAX_2D20_DICE = 5;
CONFIG.MAX_2D20_PURCHASE = 3;

CONFIG.skills = {
  acr: 'MUTANT.skills.acr',
  mel: 'MUTANT.skills.mel',
  ste: 'MUTANT.skills.ste',
  ins: 'MUTANT.skills.ins',
  obs: 'MUTANT.skills.obs',
  sur: 'MUTANT.skills.sur',
  thi: 'MUTANT.skills.thi',
  ath: 'MUTANT.skills.ath',
  res: 'MUTANT.skills.res',
  par: 'MUTANT.skills.par',
  ran: 'MUTANT.skills.ran',
  sai: 'MUTANT.skills.sai',
  alc: 'MUTANT.skills.alc',
  cra: 'MUTANT.skills.cra',
  hea: 'MUTANT.skills.hea',
  lin: 'MUTANT.skills.lin',
  lor: 'MUTANT.skills.lor',
  war: 'MUTANT.skills.war',
  ani: 'MUTANT.skills.ani',
  com: 'MUTANT.skills.com',
  cou: 'MUTANT.skills.cou',
  per: 'MUTANT.skills.per',
  soc: 'MUTANT.skills.soc',
  dis: 'MUTANT.skills.dis',
  sor: 'MUTANT.skills.sor',
};

CONFIG.skillAttributeMap = {
  acr: 'agi',
  mel: 'agi',
  ste: 'agi',
  ins: 'awa',
  obs: 'awa',
  sur: 'awa',
  thi: 'awa',
  ath: 'bra',
  res: 'bra',
  par: 'coo',
  ran: 'coo',
  sai: 'coo',
  alc: 'int',
  cra: 'int',
  hea: 'int',
  lin: 'int',
  lor: 'int',
  war: 'int',
  ani: 'per',
  com: 'per',
  cou: 'per',
  per: 'per',
  soc: 'per',
  dis: 'wil',
  sor: 'wil',
};

CONFIG.enchantmentExplodingItems = {
  flashPaper: 'MUTANT.enchantmentExplodingItems.fla',
  smallFireworks: 'MUTANT.enchantmentExplodingItems.sma',
  loudFireworks: 'MUTANT.enchantmentExplodingItems.lou',
  largeFireworks: 'MUTANT.enchantmentExplodingItems.lar',
  smallExplosives: 'MUTANT.enchantmentExplodingItems.sme',
  largeExplosives: 'MUTANT.enchantmentExplodingItems.lex',
};

CONFIG.enchantmentStrengths = {
  weak: 'MUTANT.enchantmentStrengths.wea',
  average: 'MUTANT.enchantmentStrengths.ave',
  potent: 'MUTANT.enchantmentStrengths.pot',
  dangerous: 'MUTANT.enchantmentStrengths.dan',
  extraordinary: 'MUTANT.enchantmentStrengths.ext',
  devastationg: 'MUTANT.enchantmentStrengths.dev',
};

CONFIG.enchantmentBlindingStrengths = {
  regular: 'MUTANT.enchantmentBlindingStrengths.reg',
  dry: 'MUTANT.enchantmentBlindingStrengths.dry',
  fine: 'MUTANT.enchantmentBlindingStrengths.fin',
  perfumed: 'MUTANT.enchantmentBlindingStrengths.per',
  burning: 'MUTANT.enchantmentBlindingStrengths.bur',
};

CONFIG.enchantmentTalismanTypes = {
  hamsa: 'MUTANT.enchantmentTalismanTypes.ham',
  chasme: 'MUTANT.enchantmentTalismanTypes.cha',
  pictish: 'MUTANT.enchantmentTalismanTypes.pic',
  nazar: 'MUTANT.enchantmentTalismanTypes.naz',
  animal: 'MUTANT.enchantmentTalismanTypes.ani',
};

CONFIG.enchantmentTypes = {
  explodingPowder: 'MUTANT.enchantmentTypes.exp',
  blindingPowder: 'MUTANT.enchantmentTypes.bli',
  burningLiquid: 'MUTANT.enchantmentTypes.bur',
  reinforcedFabric: 'MUTANT.enchantmentTypes.rei',
  upasGlass: 'MUTANT.enchantmentTypes.upa',
  talisman: 'MUTANT.enchantmentTypes.tal',
  lotusPollen: 'MUTANT.enchantmentTypes.lot',
};

CONFIG.upasGlassSizes = {
  resilient: 'MUTANT.upasGlassSizes.res',
  strengthened: 'MUTANT.upasGlassSizes.str',
  unbreakable: 'MUTANT.upasGlassSizes.unb',
};

CONFIG.enchantmentVolatilities = {
  burningAlcohol: 'MUTANT.enchantmentVolatilities.bur',
  explodingLiquor: 'MUTANT.enchantmentVolatilities.exp',
  volatileSpirits: 'MUTANT.enchantmentVolatilities.vol',
  hellishBrimstone: 'MUTANT.enchantmentVolatilities.hel',
};

CONFIG.expertiseFields = {
  mov: 'MUTANT.expertiseFields.mov',
  cmb: 'MUTANT.expertiseFields.cmb',
  frt: 'MUTANT.expertiseFields.frt',
  knw: 'MUTANT.expertiseFields.knw',
  scl: 'MUTANT.expertiseFields.scl',
  sns: 'MUTANT.expertiseFields.sns',
};

CONFIG.expertiseAttributeMap = {
  mov: 'agi',
  cmb: 'agi',
  frt: 'bra',
  knw: 'int',
  scl: 'per',
  sns: 'awa',
};

CONFIG.rollDifficultyLevels = {
  0: 'MUTANT.skillRollDifficultyLevels.0',
  1: 'MUTANT.skillRollDifficultyLevels.1',
  2: 'MUTANT.skillRollDifficultyLevels.2',
  3: 'MUTANT.skillRollDifficultyLevels.3',
  4: 'MUTANT.skillRollDifficultyLevels.4',
  5: 'MUTANT.skillRollDifficultyLevels.5',
};

CONFIG.skillRollResourceSpends = {
  momentum: 'MUTANT.skillRollResourceSpends.mome',
  doom: 'MUTANT.skillRollResourceSpends.doom',
};

CONFIG.rollResults = {
  success: 'MUTANT.skillRollSuccess',
  failure: 'MUTANT.skillRollFailure',
};

CONFIG.enchantmentIngredients = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
};

CONFIG.attacks = {
  weapon: 'MUTANT.attackTypes.weapon',
  display: 'MUTANT.attackTypes.display',
};

CONFIG.attackTypes = {
  melee: 'MUTANT.attackTypes.melee',
  ranged: 'MUTANT.attackTypes.ranged',
  threaten: 'MUTANT.attackTypes.threaten',
};

CONFIG.damageTypes = {
  mental: 'MUTANT.damageTypes.mental',
  physical: 'MUTANT.damageTypes.physical',
};

CONFIG.npcActionTypes = {
  abilities: 'MUTANT.npcActionTypes.abilities',
  doom: 'MUTANT.npcActionTypes.doom',
};

CONFIG.npcTraits = {
  horror: 'MUTANT.npcCategories.horror',
  undead: 'MUTANT.npcCategories.undead',
};

CONFIG.npcAttackTypes = {
  melee: 'MUTANT.npcAttackTypes.melee',
  ranged: 'MUTANT.npcAttackTypes.ranged',
  threaten: 'MUTANT.npcAttackTypes.threaten',
};

CONFIG.npcTypes = {
  minion: 'MUTANT.npcCategories.minion',
  toughened: 'MUTANT.npcCategories.toughened',
  nemesis: 'MUTANT.npcCategories.nemesis',
};

CONFIG.availabilityTypes = {
  1: 'MUTANT.skillRollDifficultyLevels.1',
  2: 'MUTANT.skillRollDifficultyLevels.2',
  3: 'MUTANT.skillRollDifficultyLevels.3',
  4: 'MUTANT.skillRollDifficultyLevels.4',
  5: 'MUTANT.skillRollDifficultyLevels.5',
};

CONFIG.conditionTypes = {
  blind: 'MUTANT.conditions.bli',
  burningx: 'MUTANT.conditions.bur',
  dazed: 'MUTANT.conditions.daz',
  deaf: 'MUTANT.conditions.dea',
  guardBroken: 'MUTANT.conditions.gua',
  hindered: 'MUTANT.conditions.hin',
  poisoned: 'MUTANT.conditions.poi',
  prone: 'MUTANT.conditions.pro',
  staggered: 'MUTANT.conditions.sta',
};

CONFIG.naturesTypes = {
  cautious: 'MUTANT.natures.cautious',
  curious: 'MUTANT.natures.curious',
  inspirational: 'MUTANT.natures.inspirational',
  learned: 'MUTANT.natures.learned',
  practical: 'MUTANT.natures.practical',
  scheming: 'MUTANT.natures.scheming',
  sneaky: 'MUTANT.natures.sneaky',
  stoic: 'MUTANT.natures.stoic',
  supportive: 'MUTANT.natures.supportive',
  wrathful: 'MUTANT.natures.wrathful',
};

CONFIG.coverageTypes = {
  head: 'MUTANT.coverage.head',
  torso: 'MUTANT.coverage.torso',
  larm: 'MUTANT.coverage.larm',
  rarm: 'MUTANT.coverage.rarm',
  lleg: 'MUTANT.coverage.lleg',
  rleg: 'MUTANT.coverage.rleg',
};

CONFIG.armorTypes = {
  heavyCloth: 'MUTANT.armorTypes.heavycloth',
  lightArmor: 'MUTANT.armorTypes.lightarmor',
  heavyArmor: 'MUTANT.armorTypes.heavyarmor',
  veryHeavyArmor: 'MUTANT.armorTypes.vheavyarmor',
};

CONFIG.armorQualities = {
  brittle: 'MUTANT.qualities.armor.brit',
  bulky: 'MUTANT.qualities.armor.bulk',
  cool: 'MUTANT.qualities.armor.cool',
  couragex: 'MUTANT.qualities.armor.cour',
  fragile: 'MUTANT.qualities.armor.frag',
  heavy: 'MUTANT.qualities.armor.heav',
  intimidating: 'MUTANT.qualities.armor.inti',
  noisy: 'MUTANT.qualities.armor.nois',
  mentalPiercingx: 'MUTANT.qualities.armor.apie',
  vheavy: 'MUTANT.qualities.armor.very',
  warm: 'MUTANT.qualities.armor.warm',
};

CONFIG.actionTypes = {
  passive: 'MUTANT.actionPassive',
  free: 'MUTANT.actionFree',
  minor: 'MUTANT.actionMinor',
  standard: 'MUTANT.actionStandard',
  reaction: 'MUTANT.actionReaction',
};

CONFIG.freeActions = {
  adjust: 'MUTANT.actions.free.adj',
  dropItem: 'MUTANT.actions.free.dro',
  dropProne: 'MUTANT.actions.free.pro',
  simpleTask: 'MUTANT.actions.free.sim',
  speak: 'MUTANT.actions.free.spe',
};

CONFIG.minorActions = {
  clear: 'MUTANT.actions.minor.cle',
  drawItem: 'MUTANT.actions.minor.dra',
  movement: 'MUTANT.actions.minor.mov',
  regainGuard: 'MUTANT.actions.minor.reg',
  stand: 'MUTANT.actions.minor.sta',
};

CONFIG.standardActions = {
  assist: 'MUTANT.actions.standard.ass',
  attack: 'MUTANT.actions.standard.att',
  brace: 'MUTANT.actions.standard.bra',
  exploit: 'MUTANT.actions.standard.exp',
  pass: 'MUTANT.actions.standard.pas',
  ready: 'MUTANT.actions.standard.rea',
  recover: 'MUTANT.actions.standard.rec',
  skillTest: 'MUTANT.actions.standard.ski',
  sprint: 'MUTANT.actions.standard.spr',
  treatment: 'MUTANT.actions.standard.tre',
  withdraw: 'MUTANT.actions.standard.wit',
};

CONFIG.reactionActions = {
  defend: 'MUTANT.actions.reaction.def',
  protect: 'MUTANT.actions.reaction.pro',
  retaliate: 'MUTANT.actions.reaction.ret',
};

CONFIG.actionCategories = {
  defensive: 'MUTANT.actionCategories.def',
  offensive: 'MUTANT.actionCategories.off',
  interaction: 'MUTANT.actionCategories.int',
  movement: 'MUTANT.actionCategories.mov',
};

CONFIG.actionCounts = {
  1: 'MUTANT.actionCounts.1',
  2: 'MUTANT.actionCounts.2',
  '1r': 'MUTANT.actionCounts.1r',
};

CONFIG.kitTypes = {
  facility: 'MUTANT.kitTypes.fac',
  kit: 'MUTANT.kitTypes.kit',
  library: 'MUTANT.kitTypes.lib',
  reload: 'MUTANT.kitTypes.rel',
  resource: 'MUTANT.kitTypes.res',
  tool: 'MUTANT.kitTypes.too',
};

CONFIG.kitUses = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  inf: '&infin;',
};

CONFIG.lotusPollenColors = {
  black: 'MUTANT.lotusPollenColors.black',
  purple: 'MUTANT.lotusPollenColors.purple',
  yellow: 'MUTANT.lotusPollenColors.yellow',
  green: 'MUTANT.lotusPollenColors.green',
  gray: 'MUTANT.lotusPollenColors.gray',
  golden: 'MUTANT.lotusPollenColors.golden',
};

CONFIG.lotusPollenDifficulty = {
  per: 'MUTANT.lotusPollenDifficulty',
};

CONFIG.lotusPollenForms = {
  gas: 'MUTANT.lotusPollenForms.gas',
  powder: 'MUTANT.lotusPollenForms.pow',
  liquid: 'MUTANT.lotusPollenForms.liq',
};

CONFIG.lotusPollenUses = {
  opiate: 'MUTANT.lotusPollenUses.opi',
  poison: 'MUTANT.lotusPollenUses.poi',
  paralytic: 'MUTANT.lotusPollenUses.par',
  hallucinogenic: 'MUTANT.lotusPollenUses.hal',
  enchantment: 'MUTANT.lotusPollenUses.enc',
  anger: 'MUTANT.lotusPollenUses.ang',
  madness: 'MUTANT.lotusPollenUses.mad',
};

CONFIG.languages = {
  afghuli: 'MUTANT.languages.afgh',
  argossean: 'MUTANT.languages.argo',
  aquilonian: 'MUTANT.languages.aqui',
  brythunian: 'MUTANT.languages.bryt',
  corinthian: 'MUTANT.languages.cori',
  cimmerian: 'MUTANT.languages.cimm',
  darfari: 'MUTANT.languages.darf',
  hyperborean: 'MUTANT.languages.hype',
  hyrkanian: 'MUTANT.languages.hyrk',
  iranistani: 'MUTANT.languages.iran',
  keshani: 'MUTANT.languages.kesh',
  kothic: 'MUTANT.languages.koth',
  kushite: 'MUTANT.languages.kush',
  nemedian: 'MUTANT.languages.neme',
  nordheimer: 'MUTANT.languages.nord',
  ophirian: 'MUTANT.languages.ophi',
  punt: 'MUTANT.languages.punt',
  shemitish: 'MUTANT.languages.shem',
  stygian: 'MUTANT.languages.styg',
  turanian: 'MUTANT.languages.tura',
  vendhyan: 'MUTANT.languages.vend',
  zamorian: 'MUTANT.languages.zamo',
  zembabwein: 'MUTANT.languages.zemb',
  zingaran: 'MUTANT.languages.zing',
};

CONFIG.statusEffects = [
  {
    icon: 'systems/mc3e/assets/icons/conditions/blind.png',
    id: 'blind',
    label: 'MUTANT.conditions.bli',
    title: 'MUTANT.conditionDescriptionBlin',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/burningx.png',
    id: 'burningx',
    label: 'MUTANT.conditions.bur',
    title: 'MUTANT.conditionDescriptionBurn',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: 1,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/dazed.png',
    id: 'dazed',
    label: 'MUTANT.conditions.daz',
    title: 'MUTANT.conditionDescriptionDaze',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/deaf.png',
    id: 'deaf',
    label: 'MUTANT.conditions.dea',
    title: 'MUTANT.conditionDescriptionDeaf',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/guardbreak.png',
    id: 'guardBroken',
    label: 'MUTANT.conditions.gua',
    title: 'MUTANT.conditionDescriptionGuar',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/hindered.png',
    id: 'hindered',
    label: 'MUTANT.conditions.hin',
    title: 'MUTANT.conditionDescriptionHind',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/poisoned.png',
    id: 'poisoned',
    label: 'MUTANT.conditions.poi',
    title: 'MUTANT.conditionDescriptionPois',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/prone.png',
    id: 'prone',
    label: 'MUTANT.conditions.pro',
    title: 'MUTANT.conditionDescriptionPron',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
  {
    icon: 'systems/mc3e/assets/icons/conditions/staggered.png',
    id: 'staggered',
    label: 'MUTANT.conditions.sta',
    title: 'MUTANT.conditionDescriptionStag',
    flags: {
      mc3e: {
        trigger: 'endRound',
        value: null,
      },
    },
  },
];

CONFIG.talentRanks = {
  1: 1,
  2: 2,
  3: 3,
};

CONFIG.transpoAnimals = {
  one: 'MUTANT.transpoAnimals.1',
  onep: 'MUTANT.transpoAnimals.1p',
  two: 'MUTANT.transpoAnimals.2',
  twop: 'MUTANT.transpoAnimals.2p',
  four: 'MUTANT.transpoAnimals.4',
  fourp: 'MUTANT.transpoAnimals.4p',
};

CONFIG.transpoBoatTypes = {
  bireme: 'MUTANT.transpoBoatTypes.bireme',
  canoe: 'MUTANT.transpoBoatTypes.canoe',
  carrack: 'MUTANT.transpoBoatTypes.carrack',
  cog: 'MUTANT.transpoBoatTypes.cog',
  galley: 'MUTANT.transpoBoatTypes.galley',
  gondola: 'MUTANT.transpoBoatTypes.gondola',
  kayak: 'MUTANT.transpoBoatTypes.kayak',
  longboat: 'MUTANT.transpoBoatTypes.longboat',
  longship: 'MUTANT.transpoBoatTypes.longship',
  raft: 'MUTANT.transpoBoatTypes.raft',
};

CONFIG.transpoCapabilities = {
  p: 'MUTANT.transpoCapabilities.p',
  mp: 'MUTANT.transpoCapabilities.mp',
  bmp: 'MUTANT.transpoCapabilities.bmp',
};

CONFIG.transpoCartTypes = {
  carriage: 'MUTANT.transpoCartTypes.carriage',
  cart: 'MUTANT.transpoCartTypes.cart',
  hchar: 'MUTANT.transpoCartTypes.hchar',
  lchar: 'MUTANT.transpoCartTypes.lchar',
  litter: 'MUTANT.transpoCartTypes.litter',
  wagon: 'MUTANT.transpoCartTypes.wagon',
  pwagon: 'MUTANT.transpoCartTypes.pwagon',
};

CONFIG.transpoCategories = {
  mounts: 'MUTANT.transpoCategories.mounts',
  carts: 'MUTANT.transpoCategories.carts',
  boats: 'MUTANT.transpoCategories.boats',
};

CONFIG.transpoMountTypes = {
  buffalo: 'MUTANT.transpoMountTypes.buffalo',
  camel: 'MUTANT.transpoMountTypes.camel',
  donkey: 'MUTANT.transpoMountTypes.donkey',
  dhorse: 'MUTANT.transpoMountTypes.dhorse',
  rhorse: 'MUTANT.transpoMountTypes.rhorse',
  whorse: 'MUTANT.transpoMountTypes.whorse',
};

CONFIG.talentTypes = {
  homeland: 'MUTANT.talentTypes.homeland',
  caste: 'MUTANT.talentTypes.caste',
  bloodline: 'MUTANT.talentTypes.bloodline',
  education: 'MUTANT.talentTypes.education',
  nature: 'MUTANT.talentTypes.nature',
  archetype: 'MUTANT.talentTypes.archetype',
  skill: 'MUTANT.talentTypes.skill',
  other: 'MUTANT.talentTypes.other',
};

CONFIG.weaponQualities = {
  area: 'MUTANT.qualities.weapons.area',
  backlashx: 'MUTANT.qualities.weapons.back',
  blessedx: 'MUTANT.qualities.weapons.bles',
  blinding: 'MUTANT.qualities.weapons.blin',
  brilliant: 'MUTANT.qualities.weapons.bril',
  cavalryx: 'MUTANT.qualities.weapons.cava',
  cursedx: 'MUTANT.qualities.weapons.curs',
  enchantedx: 'MUTANT.qualities.weapons.ench',
  ensorcelledx: 'MUTANT.qualities.weapons.enso',
  familiar: 'MUTANT.qualities.weapons.fami',
  fearsomex: 'MUTANT.qualities.weapons.fear',
  fragile: 'MUTANT.qualities.weapons.frag',
  grappling: 'MUTANT.qualities.weapons.grap',
  hiddenx: 'MUTANT.qualities.weapons.hidd',
  improvised: 'MUTANT.qualities.weapons.impr',
  intriguingx: 'MUTANT.qualities.weapons.intr',
  incendiaryx: 'MUTANT.qualities.weapons.ince',
  intense: 'MUTANT.qualities.weapons.inte',
  keen: 'MUTANT.qualities.weapons.keen',
  knockdown: 'MUTANT.qualities.weapons.knoc',
  maledictionx: 'MUTANT.qualities.weapons.male',
  nonlethal: 'MUTANT.qualities.weapons.nonl',
  pairedx: 'MUTANT.qualities.weapons.pair',
  parrying: 'MUTANT.qualities.weapons.parr',
  patron: 'MUTANT.qualities.weapons.patr',
  persistentx: 'MUTANT.qualities.weapons.pers',
  piercingx: 'MUTANT.qualities.weapons.pier',
  purposex: 'MUTANT.qualities.weapons.purp',
  regalx: 'MUTANT.qualities.weapons.rega',
  sanguinex: 'MUTANT.qualities.weapons.sang',
  shieldx: 'MUTANT.qualities.weapons.shie',
  spreadx: 'MUTANT.qualities.weapons.spre',
  stun: 'MUTANT.qualities.weapons.stun',
  subtlex: 'MUTANT.qualities.weapons.subt',
  thrown: 'MUTANT.qualities.weapons.thro',
  trappedx: 'MUTANT.qualities.weapons.trap',
  unforgivingx: 'MUTANT.qualities.weapons.unfo',
  viciousx: 'MUTANT.qualities.weapons.vici',
  volley: 'MUTANT.qualities.weapons.voll',
  weak: 'MUTANT.qualities.weapons.weak',
};

CONFIG.weaponGroups = {
  axe: 'MUTANT.weaponGroup.axe',
  bow: 'MUTANT.weaponGroup.bow',
  club: 'MUTANT.weaponGroup.clu',
  crossbow: 'MUTANT.weaponGroup.cro',
  dagger: 'MUTANT.weaponGroup.dag',
  flail: 'MUTANT.weaponGroup.fla',
  flexible: 'MUTANT.weaponGroup.fle',
  hidden: 'MUTANT.weaponGroup.hid',
  improvised: 'MUTANT.weaponGroup.imp',
  polearm: 'MUTANT.weaponGroup.pol',
  shield: 'MUTANT.weaponGroup.shi',
  sling: 'MUTANT.weaponGroup.sli',
  sword: 'MUTANT.weaponGroup.swo',
  spear: 'MUTANT.weaponGroup.spe',
};

CONFIG.weaponTypes = {
  melee: 'MUTANT.weaponTypes.melee',
  ranged: 'MUTANT.weaponTypes.ranged',
};

CONFIG.weaponSizes = {
  none: 'MUTANT.weaponSizes.no',
  oneHanded: 'MUTANT.weaponSizes.1h',
  twoHanded: 'MUTANT.weaponSizes.2h',
  unbalanced: 'MUTANT.weaponSizes.ub',
  unwieldy: 'MUTANT.weaponSizes.uw',
  fixed: 'MUTANT.weaponSizes.fi',
  monstrous: 'MUTANT.weaponSizes.mo',
};

CONFIG.weaponReaches = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
};

CONFIG.weaponRanges = {
  close: 'MUTANT.weaponRanges.c',
  medium: 'MUTANT.weaponRanges.m',
  long: 'MUTANT.weaponRanges.l',
};

CONFIG.displayDamageDice = {
  x: 'X',
};

CONFIG.damageDice = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: '11',
  12: '12',
  13: '13',
  14: '14',
  15: '15',
  16: '16',
  17: '17',
  18: '18',
  19: '19',
  20: '20',
};

CONFIG.soakDice = {
  light: '2dp',
  heavy: '4dp',
};

CONFIG.soakValue = {
  light: 'MUTANT.SoakLight',
  heavy: 'MUTANT.SoakHeavy',
};

CONFIG.weaponDescriptions = {
  axe: 'MUTANT.weaponDescriptionAxe',
  bow: 'MUTANT.weaponDescriptionBow',
  club: 'MUTANT.weaponDescriptionClu',
  crossbow: 'MUTANT.weaponDescriptionsCro',
  dagger: 'MUTANT.weaponDescritionDag',
  dirk: 'MUTANT.weaponDescriptionDir',
  flail: 'MUTANT.weaponDescriptionFla',
  flexile: 'MUTANT.weaponDescriptionFle',
  hammer: 'MUTANT.weaponDescriptionHam',
  improvised: 'MUTANT.weaponDescriptionImp',
  pick: 'MUTANT.weaponDescriptionPic',
  polearm: 'MUTANT.weaponDescriptionPol',
  shield: 'MUTANT.weaponGroup.shi',
  sling: 'MUTANT.weaponDescriptionSli',
  sword: 'MUTANT.weaponDescriptionSwo',
  spear: 'MUTANT.weaponDescriptionSpe',
};

CONFIG.qualitiesDescriptions = {
  heavy: 'MUTANT.qualities.description.heav',
  noisy: 'MUTANT.qualities.description.nois',
  veryheavy: 'MUTANT.qualities.description.vhea',
  armorFragile: 'MUTANT.qualities.description.afra',
  area: 'MUTANT.qualities.description.area',
  backlashx: 'MUTANT.qualities.description.back',
  blinding: 'MUTANT.qualities.description.blin',
  cavalryx: 'MUTANT.qualities.description.cava',
  fearsomex: 'MUTANT.qualities.description.fear',
  fragile: 'MUTANT.qualities.description.frag',
  grappling: 'MUTANT.qualities.description.grap',
  hiddenx: 'MUTANT.qualities.description.hidd',
  improvised: 'MUTANT.qualities.description.impr',
  incendiaryx: 'MUTANT.qualities.description.ince',
  intense: 'MUTANT.qualities.description.inte',
  knockdown: 'MUTANT.qualities.description.knoc',
  nonlethal: 'MUTANT.qualities.description.nonl',
  paired: 'MUTANT.qualities.description.pair',
  parrying: 'MUTANT.qualities.description.parr',
  persistentx: 'MUTANT.qualities.description.pers',
  piercingx: 'MUTANT.qualities.description.pier',
  shieldx: 'MUTANT.qualities.description.shie',
  spreadx: 'MUTANT.qualities.description.spre',
  stun: 'MUTANT.qualities.description.stun',
  subtlex: 'MUTANT.qualities.description.subt',
  thrown: 'MUTANT.qualities.description.thro',
  unforgivingx: 'MUTANT.qualities.description.unfo',
  viciousx: 'MUTANT.qualities.description.vici',
  volley: 'MUTANT.qualities.description.voll',
  blessedx: 'MUTANT.qualities.description.bles',
  brilliant: 'MUTANT.qualities.description.bril',
  cursedx: 'MUTANT.qualities.description.curs',
  enchantedx: 'MUTANT.qualities.description.ench',
  ensorcelledx: 'MUTANT.qualities.description.enso',
  intriguingx: 'MUTANT.qualities.description.intr',
  maledictionx: 'MUTANT.qualities.description.male',
  purposex: 'MUTANT.qualities.description.purp',
  regalx: 'MUTANT.qualities.description.rega',
  sanguinex: 'MUTANT.qualities.description.sang',
  trappedx: 'MUTANT.qualities.description.trap',
  patron: 'MUTANT.qualities.description.patr',
  familiar: 'MUTANT.qualities.description.fami',
  pairedx: 'MUTANT.qualities.description.pair',
  brittle: 'MUTANT.qualities.description.brit',
  bulky: 'MUTANT.qualities.description.bulk',
  cool: 'MUTANT.qualities.description.cool',
  courage: 'MUTANT.qualities.description.cour',
  mentalPiercingx: 'MUTANT.qualities.description.apie',
  warm: 'MUTANT.qualities.description.warm',
  weak: 'MUTANT.qualities.description.weak',
  keen: 'MUTANT.qualities.description.keen',
  intimidating: 'MUTANT.qualities.description.inti',
};

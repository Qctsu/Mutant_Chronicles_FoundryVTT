<a name="v1.8.1"></a>

## [v1.8.1] - 2023-01-01

### Bugfix
- "New Scene" and "Initialize Game" macros fail if there is a player with no character.

## [v1.8.0] - 2022-12-30

### Bugfix
- Brittle armor quality typo fixed
- Journal titles unreadable when viewed with Monk's Enhanced Journal
- Points for effects not being added to custom dice rolls in chat when rolling via a `/r {x}dp` command
- Roll Modes not being applied properly to chat messages
- Shield Soak button appearing on Item card even if the item doesn't have the Shield X quality
- TextArea spacing issue causing padding to be added to Spell/Enchantment Item text
- Token effect icons broken in Firefox 104.0.1

### Enhancement
- Add a dialog for rolling basic Combat Dice
- Add ability to trigger shield soaks from the item details panel on character sheet or chat message
- Added "Basic Skill Roll" macro
- Added "Combat Dice Roll" macro
- Added "Cover Soak Dice Roll" macro
- Added "Damage Roll" macro
- Added "Initialize Game" macro
- Added "Morale Soak Dice Roll" macro
- Added "New Scene" macro
- Added "Skill Roll" macro
- Added "Soak Dice Roll" macro
- Allow Items to be dragged to the Hotbar
- Expanded/Collapsed tabs on the character sheet remember their state during a session
- Fixed Fortune "1" rolls should be shown at the beginning of dice results
- Health schema changes for consistency [internal]
- Improved Doom & Momentum tracking
- Input field color consistency improved
- Make encumbrance setting for Items free text rather than selector
- NPC Sheets now have Max Wounds and Max Traumas fields to aid tracking damage
- Started adding some basic system documentation
- Tidy and enhance the Damage Roll dialog
- Tidy and enhance the Skill Roll dialog
- Tidy and enhance the Soak Roll dialog
- Tidy and improve the Momentum Banking dialog

## [v1.7.1] - 2022-08-31

### Bugfix
- Fixed unable to edit Display action on character sheet
- Fixed item chat card overlapping text
- Fixed PCs unable to attack with Display Action
- Swap to SVG images from WEBP bitmaps for better dice images

## [v1.7.0] - 2022-08-30

### Enhancement
- V10 Foundry Support!
- Character Sheet reorganization
- Added more XP / Fortune values
- Skill Roll Cards Overhauled
- Added Conditions for tracking Blocking and Prone
- New dice images for chat cards
- General usability fixups
- Allow encumbrance values on miscellaneous items
- Improved accessibility on NPC skills

### Bugfix
- Fixed mob rolls
- Added stowage items to migration scripts
- Added World compendium to migration scripts
- Fixed issue with item id's in schema update to allow miscellaneous items to be stowed
- Removed use of deprecated entity field on package definitions
- Fixed incorrect kit types and costs for reloads
- Fixed incorrect reroll of hit location
- Fixed npcattack caht button to correctly use actor when calculating rolls for unlinked actors

## [v1.6.1] - 2022-04-03

### Bugfix
- Fix breakage in stowage for unmigrated actors

## [v1.6.0] - 2022-04-02

### Enhancement
- Major refactor of transportation encumbrance tracking and item stowage
- Consumable items can now be increased/decreased with button presses
- Character sheet sections are now collapsable

### Bugfix
- Fixed character profile image ui overlap
- Added missing summary labels
- Fixed equipped weapon encumbrance miscalculation
- Condition labels now use i18n text
- Fixed display of shield soak in armor section of character sheet
- Cleanup of icon and font sizes across character sheet
- Some cosmetic cleanup of chat cards
- Removed deprecated deleteOwnedItem calls causing npc corruption
- Fixed value field name for traumas

### Chores
- Fixup to CI jobs

## [v1.5.0] - 2022-01-07

### Enhancement
- Added prefill for difficulty and attribute selection on NPC skill rolls
- Added the ability for players to arbitrarily alter and track their Maximum health
- Added the ability for players to alter their current health with simple click, right-click, control+click
- Added sorting for Weapon and Display attacks on the Action tab

### Bugfix
- Only equipped weapons now have actions added to the actions tab.
- Fixed a subtle bug in damage re-rolls. Re-rolls should now include the static dice from the original roll.
- Fixed a bug in damage re-roll calculation. Reroll damage totals should now be inclusive of any static damage from original roll.
- Fixed a breakage in our schema migration code. Migrations should now again be possible when necessary.
- Fixed a bug that prevented petty enchantments from being posted to chat.
- Fixed a bug that prevented lotus pollen from altering a trait
- Refactor of character details and inclusion of text input for character 'Natures'
- Removed the unecessary attribute roll button.
- Various style and compendium fixes

### Chores
- Refactored migration 1 to include safety check for current state


## [v1.4.0] - 2022-01-03

### Enhancement
- Refactor organization of talent tab into ordering by Tree
- Added Maximum Vigor and Resolve tracking to NPC sheet

### Bugfix
- Fixed deprecated function call to resolve broken NPC attacks
- Fixed vigor and resolve coloring for readability
- Fixed NPC wound tracking bug caused by conditional template compilation
- Fixed NPC Token Health always bar set to value of 7

### Chores
- Minor templating and style cleanup


## [v1.3.0] - 2021-12-27

### Enhancement
- Added simple 'Harm' tracking for 'Toughened' and 'Nemesis' NPCs
- Added arbitrary bonus d20 handling to skill rolls
- Added Calculated arbitrary momentum bonus to skill rolls
- Added support for Foundry V9 release

### Bugfix
- Fixed several typos typos in compendiums (Thanks to our new contributor! @Muttley1)
- Fixed flow Bug in PC Harm tracker (another wonderful contribution by @Muttley1)
- Fixed Armor Soak values for Brindaine Vest
- Fixed character sheet health data corruption


## [v1.2.0] - 2021-09-17

### Enhancement

- Added support for assist rolls
- Added chat message for momentum/doom banking/spends
- Added Max health to health tracker
- Added default Autolink NPC tokens to npc sheets
- Added Attribute rolls
- Added Mob count and tracking to NPC sheet
- Added upkeep cost tracking to inventory
- Added NPC dice rolls into Mob Tracker

### Bugfix

- Fixed ViciousX Title Card
- Fixed misrolled fortune conversion for NPCS
- Fixed armor coverage and condition tracking breakage
- Fixed Regression in NPC creation
- Fixed Encumbrance Tracking fix 0.8.X
- Fixed talent addition bug in NPC sheet
- Fixed poison/stagger application bug
- Fixed 0.8 relaod spends
- Fixed Minion rolls on skill checks
- Fixed item sheet for 0.8.x
- Fixed chatcard roll buttons
- Fixed DSN Integration for 0.8 changes
- Fixed token condition handling
- Fixed 0.8 npc sheets
- Fixed 0.8 armor sidebar
- Fixed 0.8 health sidebar
- Fixed 0.8 Character sheet

### Chore

- Update Node dependencies where sane.
- Update ESlint to match new JS code.
- Migration from typescript to javascript.


<a name="v1.1.0"></a>

## [v1.1.0] - 2021-05-05

### Enhancement

- Addes Compendiums for Free Core Book Content
- Added intimidating quality name to the localized list.
- Added new Item Qualities
- Added Easy difficulty (0) to possible choices.
- Updated all compendiums to include icons and more/better data.
- Added New icons for actions & displays & talents

### Bugfix

- Various combat roll fixes #200, #197, #199
- Updated compendiums to use qualities (displays, weapons and armors)
- Missing label for Regal weapon quality. Forgot the L at the end of the 4 letter code.
- Resolve "No option for D0 Simple tests on skills"
- Replaced erroneous Easy with Simple for D0 checks
- Resolve NPC attacks can go beyond 9 CD
- Fix #201 -- added 11-20 dice rows to CONFIG.damageDice
- Cleanup of packs Added Actions Compendium
- Allow passing of both doom and momentum spends on a single roll
- (fix): Swap melee weapon reach with text input
- (fix): Migrate Talent tree to text input field

### Chore

- Commit squashes lost data.
- Replace Author with Author(s) in system.json
- Use build artifacts from release branch temporarily


<a name="v1.0.0"></a>

## [v1.0.0] - 2021-03-10

### Enhancement

- Full rewrite in typescript
- Initial version of the NPC sheet redesign, still bugged by base.ts getData() labelling.
- Initial Item Posting
- Initial talents tab and sheet logic
- More decomposition of data model
- Replaces UI styling for all char-sheet tabs
- Restyle of inventory tab, update equip toggle color
- Revamps wound tracking to allow for treated wounds
- Added missing and incorrect content fields for armor, weapons, talents, and actions
- Added form to configure tiles and drawings for morale and cover soak rolls
- Added form to configure tiles and drawings for morale and cover soak rolls
- Added development notes to contribution doc
- Added readonly sheets, fixes languages box
- Added miscellaneous description-only item type and inventory handling
- Added missing titles and translations
- Added more information on commit signing
- Added selectable NPC attribute and calc for npc skill rolls.
- Added styling to tags on chat cards.
- Added Prefill dialog for rolls
- Swaps license to MPL v2. Explicitly limiting the use of trademarked materials in derivative works
- Added system manifest into release artifacts
- Added DSN Integration and CombatDie class
- Added check to make sure only GMs edit Counters on socket calls
- Added socket support for counters, added setting for users to edit
- Added Initial Momentum/Doom counter
- Added Noble Warrior background data
- Added the repo address in the manifest to make the system easily downloadable.
- Added skills on the left hand pane of actor sheet, issues with the CSS GRID
- Added data to all compendiums linked in the system, not all data types have been added to their compendiums (for example: not all background types ares in background.db). Fixed a few forgotten fields in template.json. Remove 2 useless files.
- Added the logic to prevent vigor and resolved to go below 0
- Added Celtic font, working on structuring the skills tab
- Added #references from .gitignore
- Added momentum spend context button
- Added gold pouch icon and and title card
- Added transporation items and encumbrance handling
- Added title class data for health/armor items
- Added title class data for conditions and qualities. Minor style tweaks
- Added gold handling to belongings tab, fix missing titles
- Added initial chat cards and some basic chat card styling
- Added sorcery and enchantments
- Added encumbrance calculation and trackin on inventory page
- Added despair/fatigue tracking several npc bug fixes
- Added npc categories and roll handling
- Added action handling and reorg sheet html
- Added attack inventory to NPC card
- Added unique chatcards for different item types, links post to header icon
- Added armor/shield tracker to sidebar
- Added armor calculation logic from equipped armors
- Added kits/resource spends/inventory expansion/bugfixes
- Added damage rolls and action generation
- Added reroll and fortune handling logic to skill tests
- Added initial skillroll logic and fortune handling
- Added weapon sheet template and logic
- Added equality check handlebars helper
- Added token settings registration
- Added defaultTokenSettings setting registration
- Added config mechanism for handlebars helpers and actor updates
- Added Talent Sheet
- Armor tracker style update
- Completes first pass of npc sheet.
- First step to changing item layout, convert equipment to armor
- Denormalize armor between npc and character actors
- Wire condition tracking through to token
- Wires momentum and doom pools to dice rolls

### Bugfix

- Corrects trait-handler behavior for all call sites
- Fixes kit and action selectors for mixed value dropdown
- Fixes CI runs against master
- Fixes rendering of enchantment traits
- Removes unused sheet from template paths
- Shift manifest path to raw master file
- Various fixes to action cards and chat cards
- Correct release url typo
- Remove unnecessary prep job and caching
- Disable linting when triggered by a tag
- Fixes trait selector vars in html
- Add 2 missings langages, change a typo in foundryconfig.example to avoid mistakes
- Major formatting issues resolved across most .ts files
- remove console.logs from trait selector, pull new types
- Changes availability to match difficulty rolls
- Cleanup and corrects attributes, expertise, and soak for npc sheet
- Cleanup and fixes for item dragging
- Cleanup of all data handling to a true state of template.json
- Cleanup unused templates, refactor templates
- Corrects object merge for PC actions
- Corrects all data inputs to appropriate types
- Corrects nested qualities value
- Corrects actor sheet data update bug
- Fix armor quality tagging
- Fix NPC item addition, armor quality calculation
- Fix sorcery styling and broken add new button
- Fix item sheet tabs
- Fixed a few changes from the original work procces. Gulp -> Webpack and guidance on the push process.
- Fixed the Input Height of the h1.char-name to fully cover the height (highest => "L" and lowest => "q") of CrushYourEnemies font.
- Fixed the Character Actor Sheet: Adjusted layout, Added the required fields on the Background tab, fixed the spells tab. Widened the default sheet size by 100px. Reduced font-size. Added some strings to the language file.
- Fixes inability to add talents with button
- Fixes spell sheet modification error.
- Fixes breakage in inventory damage roll reload spend
- Fixes failing dropdown for damage dice
- Move doom tracker to bottom of screen over macro bar

### Chore

- Create CONTRIBUTING.md
- Create CODE_OF_CONDUCT.md
- Migrate from gulp to webpack
- Correcting some informations and moving pertinent details from README to CONTRIBUTING. Clean up the packs. Added templates for issues and merge requests.
- Configures eslint and prettier for sass, js
- Changes gulpfile data dir updates readme with examples
- Alter build so webpack can run with the package.json parameters.
- Precommit fixup
- Adds notes on pre-commit and DCO to the contributing docs
- Adds pre-commit checks into CI
- Adds lints to all files for a PR branch
- Formatting and linting across remaining repo files
- Sets release stages to only trigger on `tags`
- Update linting configs, add pre-commit config
- Finalize release job
- build with latest
- Update .gitlab-ci.yml
- Update foundryconfig.example.json to provide examples of datapaths under Linux and Windows.

### Wires

- Wires momentum and doom pools to dice rolls

[v1.0.0]: https://gitlab.com/fvtt-modiphius/foundryvtt-conan2d20/compare/v1.0.0...HEAD

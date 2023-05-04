/* eslint-disable no-unused-vars */
import {MigrationBase} from './base';

import {Update_031421} from './updates/Update_031421';
import {Update_220106} from './updates/Update_220106';
import {Update_22040301} from './updates/Update_22040301';
import {Update_22081201} from './updates/Update_22081201';
import {Update_22102901} from './updates/Update_22102901';
import {Update_22110501} from './updates/Update_22110501';
import {Update_22120601} from './updates/Update_22120601';
import {Update_22122701} from './updates/Update_22122701';

export default class Migrations {
  static list = [
    Update_031421,
    Update_220106,
    Update_22040301,
    Update_22081201,
    Update_22102901,
    Update_22110501,
    Update_22120601,
    Update_22122701,
  ];

  static get latestVersion() {
    return Math.max(...this.list.map(Migration => Migration.version));
  }

  static constructAll() {
    return this.list.map(Migration => new Migration());
  }
}

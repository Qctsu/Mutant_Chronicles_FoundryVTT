/* eslint-disable no-unused-vars */

class C2Utility {
  static addDots(data, woundMax = 0, valueAttribute = 'status') {
    const statuses = ['healed', 'treated', 'wounded'];
    for (let i = 0; i < woundMax; i += 1) {
      if (data.dots[i].length === 0) {
        data.dots[i] = {
          status: 'healed',
          icon: 'far fa-circle',
        };
      }
    }
    return data;
  }

  static getAttackDescription(item) {
    const flavor = {
      description: 'MUTANT.attack.default.description',
      success: 'MUTANT.attack.default.success',
      opt: {},
    };

    if ((item?.system?.qualities?.value ?? []).includes('improvised')) {
      flavor.description = 'MUTANT.attacks.improvised.description';
    } else if (item?.system?.weaponType === 'melee') {
      flavor.description = 'MUTANT.attacks.melee.description';
    } else if (item?.system?.weaponType === 'ranged') {
      flavor.description = 'MUTANT.attacks.ranged.description';
    } else if (item?.system?.damage?.type === 'mental') {
      flavor.description = `${item?.system?.description?.value}`;
    }
    return flavor;
  }

  static calculateArmor(armorItems, shieldItems = undefined) {
    let shields;
    if (shieldItems === undefined) {
      shields = [];
    } else {
      shields = shieldItems;
    }
    const armor = {
      head: {
        soak: [0],
        qualities: [],
      },
      torso: {
        soak: [0],
        qualities: [],
      },
      larm: {
        soak: [0],
        qualities: [],
      },
      rarm: {
        soak: [0],
        qualities: [],
      },
      lleg: {
        soak: [0],
        qualities: [],
      },
      rleg: {
        soak: [0],
        qualities: [],
      },
      shield: {
        soak: [0],
      },
    };

    for (let x = 0; x < shields.length; x += 1) {
      if (shields[x].system.equipped && shields[x].system.broken !== true) {
        for (let i = 0; i < shields[x].system.qualities.value.length; i += 1) {
          if (shields[x].system.qualities.value[i].type === 'shieldx') {
            armor.shield.soak.push(
              parseInt(shields[x].system.qualities.value[i].value)
            );
          }
        }
      }
    }
    for (let x = 0; x < armorItems.length; x += 1) {
      if (
        armorItems[x].system.equipped &&
        armorItems[x].system.broken !== true
      ) {
        for (
          let i = 0;
          i < armorItems[x].system.coverage.value.length;
          i += 1
        ) {
          if (armorItems[x].system.coverage.value[i] === 'head') {
            armor.head.soak.push(armorItems[x].system.soak);
            if (armorItems[x].system.qualities.value.length > 0) {
              armor.head.qualities.push(
                ...armorItems[x].system.qualities.value
              );
            }
          } else if (armorItems[x].system.coverage.value[i] === 'torso') {
            armor.torso.soak.push(armorItems[x].system.soak);
            if (armorItems[x].system.qualities.value.length > 0) {
              armor.torso.qualities.push(
                ...armorItems[x].system.qualities.value
              );
            }
          } else if (armorItems[x].system.coverage.value[i] === 'larm') {
            armor.larm.soak.push(armorItems[x].system.soak);
            if (armorItems[x].system.qualities.value.length > 0) {
              armor.larm.qualities.push(
                ...armorItems[x].system.qualities.value
              );
            }
          } else if (armorItems[x].system.coverage.value[i] === 'rarm') {
            armor.rarm.soak.push(armorItems[x].system.soak);
            if (armorItems[x].system.qualities.value.length > 0) {
              armor.rarm.qualities.push(
                ...armorItems[x].system.qualities.value
              );
            }
          } else if (armorItems[x].system.coverage.value[i] === 'lleg') {
            armor.lleg.soak.push(armorItems[x].system.soak);
            if (armorItems[x].system.qualities.value.length > 0) {
              armor.lleg.qualities.push(
                ...armorItems[x].system.qualities.value
              );
            }
          } else if (armorItems[x].system.coverage.value[i] === 'rleg') {
            armor.rleg.soak.push(armorItems[x].system.soak);
            if (armorItems[x].system.qualities.value.length > 0) {
              armor.rleg.qualities.push(
                ...armorItems[x].system.qualities.value
              );
            }
          }
        }
      }
    }

    const locationCount = {
      heavy: 0,
      vheavy: 0,
      noisy: 0,
      other: [],
    };

    for (const entry in armor) {
      if ({}.hasOwnProperty.call(armor, entry)) {
        armor[entry].soak.sort((a, b) => a - b);
        armor[entry].soak.reverse();
        const uniq = [...new Set(armor[entry].qualities)];
        armor[entry].qualities = uniq;
        const innerCount = armor[entry].soak.length;
        if (innerCount > 2 && armor[entry].qualities.includes('heavy')) {
          for (let i = 0; i < armor[entry].qualities.length; i += 1) {
            if (armor[entry].qualities[i] === 'heavy') {
              armor[entry].qualities[i] = 'vheavy';
            }
          }
        } else if (innerCount > 2 && armor[entry].qualities.length === 0) {
          armor[entry].qualities.push('heavy');
        }

        for (let i = 0; i < armor[entry].qualities.length; i += 1) {
          if (armor[entry].qualities[i] === 'heavy') {
            locationCount.heavy += 1;
          } else if (armor[entry].qualities[i] === 'vheavy') {
            locationCount.vheavy += 1;
          } else if (armor[entry].qualities[i] === 'noisy') {
            locationCount.noisy += 1;
          } else {
            locationCount.other.push(armor[entry].qualities[i]);
            const uniqOther = [...new Set(locationCount.other)];
            locationCount.other = uniqOther;
          }
        }
      }
    }

    Object.assign(armor, {qualityCount: locationCount});
    return armor;
  }
}
export default C2Utility;

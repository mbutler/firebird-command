/**
 * This module handles weapon data
 * @module Weapons
 */

let _ = require('lodash')

let weapons = [
    {
        name: "m16a1",
        automatic: true,
        aimTime: [-99, -22, -12, -9, -7, -6, -5, -4, -3, -2, -1, 0],
        reloadTime: 8,
        rateOfFire: 7,
        ammoCap: 30,
        currentAmmo: 30,
        ammoWeight: 1,
        ammoType: {
            fmj: {
                pen: 17,
                dc: 6
            },
            jhp: {
                pen: 16,
                dc: 8
            },
            ap: {
                pen: 23,
                dc: 6
            }
        }
    },
    {
        name: "colt-45",
        automatic: false,
        aimTime: [-99, -18, -11, -10, -9, -8, -7],
        reloadTime: 4,
        rateOfFire: 1,
        ammoCap: 7,
        currentAmmo: 7,
        ammoWeight: 0.7,
        ammoType: {
            fmj: {
                pen: 1.6,
                dc: 3
            },
            jhp: {
                pen: 1.5,
                dc: 4
            },
            ap: {
                pen: 2.2,
                dc: 3
            }
        }
    }
]

/**
 * Gets the weapon of a given unit
 *
 * @param {string} weaponName -  The unit's weapon name
 * @memberof Weapons
 * @return {object} - The weapon object from the weapons list
 */
function getWeapon(weaponName) {
    let weapon 

    _.forEach(weapons, (gun) => {
        if (gun.name === weaponName) {
            weapon = gun
        }
    })

    return weapon
}

module.exports = {
    getWeapon: getWeapon
}
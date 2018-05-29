/**
 * This module handles table lookups
 * @module Tables
 */

let _ = require('lodash')

let hitLocationTable = [
    {cover: [0, 2], open: [0, 0], location: 'Head - Glance', pd: [7, 'light wound'], opd: [7, 200, 1000, 80000]},
    {cover: [3, 17], open: [1, 2], location: 'Head - Forehead', pd: [2000, 'critical wound'], opd: [2000, 60000, 'dead', 'dead']},
    {cover: [18, 22], open: [3, 3], location: 'Head - Eye-Nose', pd: [3000, 'critical wound'], opd: [3000, 80000, 'dead', 'dead']},
    {cover: [23, 38], open: [4, 5], location: 'Head - Mouth', pd: [300, 'critical wound'], opd: [300, 6000, 30000, 'dead']},
    {cover: [39, 56], open: [6, 8], location: 'Arm - Glance', pd: [1, 'superficial wound'], opd: [1, 5, 11, 32]},
    {cover: [57, 69], open: [9, 10], location: 'Arm - Shoulder', pd: [21, 'disabling injury'], opd: [21, 500, 1000, 1000]},
    {cover: [70, 76], open: [11, 11], location: 'Arm - Upper Arm - Flesh', pd: [3, 'superficial wound'], opd: [3, 12, 100, 100]},
    {cover: [77, 80], open: [12, 12], location: 'Arm - Upper Arm - Bone', pd: [7, 'disabling injury'], opd: [7, 60, 100, 100]},
    {cover: [81, 83], open: [13, 13], location: 'Arm - Forearm - Flesh', pd: [3, 'superficial wound'], opd: [3, 12, 50, 50]},
    {cover: [84, 92], open: [14, 14], location: 'Arm - Forearm - Bone', pd: [6, 'disabling injury'], opd: [6, 60, 60, 60]},
    {cover: [93, 95], open: [15, 15], location: 'Arm - Hand', pd: [3, 'superficial wound'], opd: [3, 8, 15, 15]},
    {cover: [96, 99], open: [16, 16], location: 'Arm - Weapon', pd: [0, 'weapon critical'], opd: [0, 0, 0, 0]},
    {open: [17, 19], location: 'Body - Glance', pd: [1, 'superficial wound'], opd: [1, 7, 16, 47]},
    {open: [20, 23], location: 'Body - Chest', pd: [51, 'heavy wound'], opd: [51, 100, 300, 2000]},
    {open: [24, 24], location: 'Body - Base of Neck', pd: [300, 'critical wound'], opd: [300, 6000, 40000, 'dead']},
    {open: [25, 25], location: 'Body - Heart', pd: [4000, 'critical wound'], opd: [4000, 100000, 'dead', 'dead']},
    {open: [26, 30], location: 'Body - Spine', pd: [300, 'critical wound'], opd: [300, 5000, 30000, 'dead']},
    {open: [31, 42], location: 'Body - Abdomen', pd: [35, 'heavy wound'], opd: [35, 900, 5000, 30000]},
    {open: [43, 56], location: 'Body - Pelvis', pd: [21, 'medium wound'], opd: [21, 100, 500, 4000]},
    {open: [57, 60], location: 'Leg - Glance', pd: [1, 'superficial wound'], opd: [1, 7, 16, 47]},
    {open: [61, 77], location: 'Leg - Thigh - Flesh', pd: [3, 'superficial wound'], opd: [3, 88, 500, 600]},
    {open: [78, 82], location: 'Leg - Thigh - Bone', pd: [16, 'disabling injury'], opd: [16, 400, 700, 700]},
    {open: [83, 99], location: 'Leg - Shin - Foot', pd: [14, 'disabling injury'], opd: [14, 200, 200, 200]}
]

let oddsOfHittingTable = [
    [-28, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-27, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-26, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-25, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-24, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-23, 4, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-22, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-21, 6, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-20, 7, 4, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [-19, 9, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [-18, 12, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [-17, 15, 8, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [-16, 18, 9, 6, 3, 2, 1, 0, 0, 0, 0, 0, 0],
    [-15, 23, 12, 7, 4, 3, 1, 0, 0, 0, 0, 0, 0],
    [-14, 27, 15, 9, 5, 4, 2, 0, 0, 0, 0, 0, 0],
    [-13, 33, 19, 12, 6, 5, 2, 1, 0, 0, 0, 0, 0],
    [-12, 39, 22, 15, 7, 6, 3, 1, 0, 0, 0, 0, 0],
    [-11, 46, 27, 18, 9, 7, 4, 1, 0, 0, 0, 0, 0],
    [-10, 53, 33, 22, 12, 9, 5, 1, 0, 0, 0, 0, 0],
    [-9, 60, 39, 27, 15, 12, 6, 2, 0, 0, 0, 0, 0],
    [-8, 67, 46, 33, 18, 15, 7, 2, 1, 0, 0, 0, 0],
    [-7, 74, 53, 39, 22, 18, 9, 3, 1, 0, 0, 0, 0],
    [-6, 80, 60, 46, 27, 22, 12, 4, 1, 0, 0, 0, 0],
    [-5, 86, 67, 53, 33, 27, 15, 5, 2, 0, 0, 0, 0],
    [-4, 90, 74, 60, 39, 33, 18, 6, 2, 0, 0, 0, 0],
    [-3, 94, 80, 67, 46, 39, 22, 7, 3, 1, 0, 0, 0],
    [-2, 96, 86, 74, 53, 46, 27, 9, 4, 1, 0, 0, 0],
    [-1, 98, 90, 80, 60, 53, 33, 12, 5, 1, 1, 0, 0],
    [0, 100, 94, 86, 67, 60, 39, 15, 6, 2, 1, 0, 0],
    [1, 100, 96, 90, 74, 67, 46, 18, 7, 2, 10, 0, 0],
    [2, 100, 98, 94, 80, 74, 53, 22, 9, 3, 2, 0, 0],
    [3, 100, 100, 96, 86, 80, 60, 27, 12, 4, 2, 0, 0],
    [4, 100, 100, 98, 90, 86, 67, 33, 15, 5, 3, 1, 0],
    [5, 100, 100, 100, 94, 90, 74, 39, 18, 6, 4, 1, 0],
    [6, 100, 100, 100, 96, 94, 80, 46, 22, 7, 5, 1, 0],
    [7, 100, 100, 100, 98, 96, 86, 53, 27, 9, 6, 2, 1],
    [8, 100, 100, 100, 100, 98, 90, 60, 33, 12, 7, 2, 1],
    [9, 100, 100, 100, 100, 100, 94, 67, 39, 15, 9, 3, 1],
    [10, 100, 100, 100, 100, 100, 96, 74, 46, 18, 12, 4, 2],
    [11, 100, 100, 100, 100, 100, 98, 80, 53, 22, 15, 5, 2],
    [12, 100, 100, 100, 100, 100, 100, 86, 60, 27, 18, 6, 3],
    [13, 100, 100, 100, 100, 100, 100, 90, 67, 33, 22, 7, 4],
    [14, 100, 100, 100, 100, 100, 100, 94, 74, 39, 27, 9, 5],
    [15, 100, 100, 100, 100, 100, 100, 96, 80, 46, 33, 12, 6],
    [16, 100, 100, 100, 100, 100, 100, 98, 86, 53, 39, 15, 7],
    [17, 100, 100, 100, 100, 100, 100, 100, 90, 60, 46, 18, 9],
    [18, 100, 100, 100, 100, 100, 100, 100, 94, 67, 53, 22, 12],
    [19, 100, 100, 100, 100, 100, 100, 100, 96, 74, 60, 27, 15],
    [20, 100, 100, 100, 100, 100, 100, 100, 98, 80, 67, 33, 18],
    [21, 100, 100, 100, 100, 100, 100, 100, 100, 86, 74, 39, 22],
    [22, 100, 100, 100, 100, 100, 100, 100, 100, 90, 80, 46, 27],
    [23, 100, 100, 100, 100, 100, 100, 100, 100, 94, 86, 53, 33],
    [24, 100, 100, 100, 100, 100, 100, 100, 100, 96, 90, 60, 39],
    [25, 100, 100, 100, 100, 100, 100, 100, 100, 98, 94, 67, 46],
    [26, 100, 100, 100, 100, 100, 100, 100, 100, 100, 96, 74, 53],
    [27, 100, 100, 100, 100, 100, 100, 100, 100, 100, 98, 80, 60],
    [28, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 86, 67],
    [29, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 90, 74],
    [30, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 94, 80],
    [31, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 96, 86],
    [32, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 98, 90],
    [33, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 94],
    [34, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 96]
]

// chart 3B
// 0 index is armor protection factor
// other 4 numbers are penetration lines
let penetrationSummaryTable = [
    [2, 3, 4, 6, 7],
    [4, 5, 7, 9, 11],
    [6, 7, 10, 12, 16],
    [10, 11, 15, 19, 25],
    [16, 17, 23, 29, 38],
    [20, 21, 28, 36, 47],
    [30, 31, 41, 53, 69],
    [40, 41, 54, 70, 91],
    [50, 51, 67, 87, 113],
    [60, 61, 80, 104, 135],
    [70, 71, 93, 120, 156],
    [100, 101, 132, 171, 222],
    [180, 181, 236, 306, 398],
    [200, 201, 262, 340, 442]
]

/**
 * The odds of hitting a target
 *
 * @param {number} accuracy -  The unit's accuracy number
 * @param {number} range -  The distance in inches
 * @memberof Tables
 * @return {number} - The percentage chance of hitting
 */
function oddsOfHitting(accuracy, range) {
    let odds = 0
    let rangeIndex = getIndexOfRange(range)

    if (accuracy < -28) {
        odds = 0
    }

    if (accuracy > 34) {
        odds = 100
    }

    _.forEach(oddsOfHittingTable, (val) => {
        if (accuracy === val[0]) {
            odds = val[rangeIndex]
        }
    })

    return odds
}

/**
 * Gets the correct index for aim mods array
 *
 * @param {number} distance -  The number of inches to target
 * @memberof Tables
 * @return {number} - The index of the weapon's aim mods array
 */
function getIndexOfRange(distance) {
    let index

    if (_.inRange(distance, 250, 999)) index = 12
    if (_.inRange(distance, 150, 250)) index = 11
    if (_.inRange(distance, 85, 150)) index = 10
    if (_.inRange(distance, 55, 85)) index = 9
    if (_.inRange(distance, 30, 55)) index = 8
    if (_.inRange(distance, 15, 30)) index = 7
    if (_.inRange(distance, 8, 15)) index = 6
    if (distance === 7) index = 5
    if (distance === 6) index = 4
    if (distance === 5) index = 4
    if (distance === 4) index = 3
    if (distance === 3) index = 2
    if (distance === 2) index = 1
    if (distance === 1) index = 1

    return index
    
}

/**
 * Gets the correct penetration line given pf and weapon pen
 *
 * @param {number} armorProtectionFactor -  Armor PF
 * @param {number} weaponPenetration -  Weapon's pen
 * @memberof Tables
 * @return {number} - The correct penetration line
 */
function getPenetrationLine(armorProtectionFactor, weaponPenetration) {    
    let line = 1
    let lineList = [] // keep a list because all values under will be included. Only need the first hit

    if (armorProtectionFactor < 2) {
        armorProtectionFactor = 2
    }

    _.forEachRight(penetrationSummaryTable, (pfLine) => {    
        if (pfLine[0] <= armorProtectionFactor) {  
            if (weaponPenetration >= pfLine[4]) {
                line = 4
            }

            if (_.inRange(weaponPenetration, pfLine[3], pfLine[4])) {
                line = 3
            }

            if (_.inRange(weaponPenetration, pfLine[2], pfLine[3])) {
                line = 2
            }

            if (_.inRange(weaponPenetration, pfLine[1], pfLine[2])) {
                line = 1
            }

            lineList.push(line)
        }
    })

    console.log('line list', lineList[0])

    return lineList[0] // the first match

}

/**
 * Finds the type of damage if the shot is glancing
 *
 * @param {number} penLine -  The weapon penetration line to use
 * @memberof Tables
 * @return {string} - The type of damage. No damage, low velocity damage, or over penetrating damage
 */
function glancingRoll(penLine) {
    let roll = _.random(0, 9)
    let result

    if (penLine === 1) {
        if (roll < 9) {
            result = 'no damage'
        } else {
            result = 'lvd'
        }
    }

    if (penLine === 2) {
        if (roll < 6) {
            result = 'no damage'
        } else {
            result = 'lvd'
        }
    }

    if (penLine === 3) {
        if (roll < 3) {
            result = 'no damage'
        } else {
            result = 'lvd'
        }
    }

    if (penLine === 4) {
        if (_.inRange(roll, 0, 3)) {
            result = 'lvd'
        } else {
            result = 'opd'
        }
    }

    return result

}

/**
 * Gets the correct hit location and damage
 *
 * @param {string} damageType -  Either lvd or opn
 * @param {number} weaponDC -  Weapon's damage class found in the weapon object
 * @param {boolean} cover - If the target has cover or not
 * @memberof Tables
 * @return {object} - The damage and hit object
 */
function getHitLocation(damageType, weaponDC, cover) {
    let roll = _.random(0, 99)
    console.log('roll', roll)
    let rollResult
    let finalResult
    let status
    let dcIndex
    let damage
    let coverList = _.filter(hitLocationTable, (o) => {return o.cover})

    if (_.inRange(weaponDC, 1, 3)) dcIndex = 0
    if (_.inRange(weaponDC, 3, 6)) dcIndex = 1
    if (_.inRange(weaponDC, 6, 9)) dcIndex = 2
    if (_.inRange(weaponDC, 9, 11)) dcIndex = 3
    if (weaponDC > 10) dcIndex = 3

    if (cover === true) {
        _.forEach(coverList, (row) => {
            if (_.inRange(roll, row.cover[0], row.cover[1] + 1)) {
                rollResult = row
            }
        })
    }

    if (cover !== true) {
        _.forEach(hitLocationTable, (row) => {
            if (_.inRange(roll, row.open[0], row.open[1] + 1)) {
                rollResult = row
            }
        })
    }

    if (damageType === 'lvd') {
        damage = rollResult.pd[0]
        status = 'hit'  
    }

    if (damageType === 'opd') {
        damage = rollResult.opd[dcIndex]
        status = 'hit'
    }

    if (damageType === 'no damage') {
        damage = 0
        status = 'absorbed by armor'
    }

    finalResult = {status: status, location: rollResult.location, type: damageType, damage: damage, wound: rollResult.pd[1]}
    return finalResult
}

/**
 * The main hit result called from the interface
 *
 * @param {object} armor -  The target's armor data
 * @param {object} weapon-  The shooter's weapon data
 * @param {boolean} cover - If the target has cover or not
 * @memberof Tables
 * @return {object} - The damage and hit object
 */
function hitResult(armor, weapon, cover) {
    let penLine = getPenetrationLine(armor.pf, weapon.ammoType.fmj.pen)
    let damageType = glancingRoll(penLine)
    let hitLocation = getHitLocation(damageType, weapon.ammoType.fmj.dc, cover)
    console.log('penline', penLine, 'damage type', damageType, 'hit location', hitLocation)

    return hitLocation
}

module.exports = {
    oddsOfHitting: oddsOfHitting,
    getHitLocation: getHitLocation,
    getPenetrationLine: getPenetrationLine,
    glancingRoll: glancingRoll,
    hitResult: hitResult
}
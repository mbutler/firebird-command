/**
 * This module handles primary game logic
 * @module Game
 */

let Database = require('./database')
let config = require('./config')
let Unit = require('./unit')
let Map = require('./map')
let Weapons = require('./weapons')
let Utils = require('./utils')
let _ = require('lodash')
let Tables = require('./tables')

/**
 * Wraps an array index around the end of an array like a loop
 *
 * @param {number} m - An array length
 * @param {number} n - An offset from current index
 * @memberof Game
 * @return {number} - The correct array index wrapped around
 */
function wrap (m, n) {
  return n >= 0 ? n % m : (n % m + m) % m
}

/**
 * Finds the correct face number in either direction and amount
 *
 * @param {number} current - The current face number, 0-5
 * @param {string} direction - Either 'right' or 'left'
 * @param {number} amount - The numer of faces to increment
 * @memberof Game
 * @return {number} - The correct hex face number
 */
function findFace (current, direction, amount) {
  let faces = _.range(0, 6)

  if (direction === 'left') return wrap(faces.length, (current - amount))
  if (direction === 'right') return wrap(faces.length, (current + amount))
}

/**
 * Converts a face number (0-5) to a two-letter cardinal direction
 *
 * @param {number} face -  A face number 0-5
 * @memberof Game
 * @return {string} - A two-letter direction. e.g. N, NW, SW, etc.
 */
function faceToDirection (face) {
  let faceString = _.toString(face)
  let map = {
    '0': 'N',
    '1': 'NE',
    '2': 'SE',
    '3': 'S',
    '4': 'SW',
    '5': 'NW'
  }

  return map[faceString]
}

/**
 * Returns the proper accuracy modifier based on shooter's position
 *
 * @param {string} position -  Either standing, kneeling, or prone
 * @memberof Game
 * @return {number} - A number to be added to the accuracy
 */
function getShooterPositionModifier(position) {
  let mod = 0
  if (position === 'kneeling') {
    mod = 3
  }

  if (position === 'prone') {
    mod = 6
  }

  return mod
}

/**
 * Returns the proper accuracy modifier based on target's position
 *
 * @param {object} target -  The enemy unit to import
 * @memberof Game
 * @return {number} - A number to be added to the accuracy
 */
function getTargetModifiers(target) {
  let mod = 0
  if (target.cover === true) {
    mod += -4
  }

  if (target.position === 'standing' && target.cover === false) {
    mod += 8
  }

  if (target.position === 'kneeling' && target.cover === false) {
    mod += 6
  }

  if (target.position === 'prone' && target.cover === false) {
    mod += 2
  }

  return mod
}

/**
 * Looks ahead and finds a hex based on a given face
 *
 * @param {object} currentCoords -  A point object of the current position
 * @param {number} facing - The face number the unit is looking towards, 0-5
 * @param {string} neighbor - The direction to find. 'forward', 'backward', or two-letter direction
 * @requires Map
 * @memberof Game
 * @return {object} - A Honeycomb hex
 */
function findNeighbor (currentCoords, facing, neighbor) {
  let currentHex = Map.grid.get(Map.Hex(currentCoords))
  let nextHex
  let nextFace = findFace(facing, 'right', 3)

  if (neighbor !== 'forward' && neighbor !== 'backward') {
    nextHex = Map.grid.neighborsOf(currentHex, neighbor)
  }

  if (neighbor === 'forward') {
    nextHex = Map.grid.neighborsOf(currentHex, faceToDirection(facing))
  }

  if (neighbor === 'backward') {
    nextHex = Map.grid.neighborsOf(currentHex, faceToDirection(nextFace))
  }

  return nextHex
}

/**
 * Changes facing 1 to the left if in moving
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function face1LeftMoving (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'left', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

/**
 * Changes unit's cover
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @param {number} totalActions - The number of actions used
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function takeCover(uniqueDesignation, totalActions) {
  let cover
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    if (unit.cover === true) {
      Unit.update({cover: false}, unit.name)
    } else {
      Unit.update({cover: true}, unit.name)
    }
  })
}

/**
 * Calculates aiming and aim mods
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @param {number} totalActions - The number of actions used for the aim
 * @requires Database
 * @requires Weapons
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function aiming (uniqueDesignation, totalActions) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let weapon = Weapons.getWeapon(unit.weapons[0])
    let aimTimeMods = weapon.aimTime
    let aimTime = totalActions
    let sal = unit.skillAccuracyLevel
    let shotAccuracy
    let roll = _.random(1, 100)
    let odds
    let range = $('#range-dropdown').find('li.selected').val()
    let target = $('#target-value').text()
    let response = "miss"
    let penalty = 0
    let damage
    let damageMultiplier = 1
    let totalDamage

    console.log(weapon)
    console.log('range: ', range)

    if (aimTime > aimTimeMods.length - 1) {
      aimTime = aimTimeMods.length - 1
    }

    if (weapon.automatic === true) {
      aimTime += 1
      damageMultiplier = Tables.autoFire(weapon.rateOfFire, range)
      console.log('rof and range', weapon.rateOfFire, range)
      console.log('damage x', damageMultiplier)
    }

    if (totalActions === 1) {
      penalty = -6
    }

    if (target !== 'none') {
      Database.singleUnit(target).once('value').then((data) => {  
        let target = data.val()
        let targetArmor = Utils.getArmor(target.bodyArmor)
        shotAccuracy = aimTimeMods[aimTime] + sal + getShooterPositionModifier(unit.position) + penalty + getTargetModifiers(target)
        odds = Tables.oddsOfHitting(shotAccuracy, range)
    
        if (roll <= odds) {
          response = "hit"
          damage = Tables.hitResult(targetArmor, weapon, target.cover)
          damage.damage = damage.damage * damageMultiplier
          applyDamage(target.name, damage)
          // {"status":"hit","location":"Head - Eye-Nose","type":"lvd","damage":3000,"wound":"critical wound"}
          console.log(`accuracy: ${shotAccuracy}, roll: ${roll}, damage: ${JSON.stringify(damage)}`)
          alert(`${_.capitalize(unit.name)} hits ${_.capitalize(target.name)}, ${damage.status}, ${damage.wound}\nlocation: ${damage.location}\ndamage: ${damage.damage}`)
        } else {
          console.log(`${_.capitalize(unit.name)}'s shot misses ${_.capitalize(target.name)}!`)
          alert(`${_.capitalize(unit.name)}'s shot misses ${_.capitalize(target.name)}!`)
        }        
      })  
    } else {
      shotAccuracy = aimTimeMods[aimTime] + sal + getShooterPositionModifier(unit.position) + penalty
        odds = Tables.oddsOfHitting(shotAccuracy, range)
    
        if (roll <= odds) {
          response = "hit"
          damage = Tables.hitResult('clothing', weapon, false)
          damage.damage = damage.damage * damageMultiplier
          console.log(`accuracy: ${shotAccuracy}, roll: ${roll}, damage: ${JSON.stringify(damage)}`)
          alert(`${_.capitalize(unit.name)} hits ${_.capitalize(target.name)}, ${damage.status}, ${damage.wound}\nlocation: ${damage.location}\ndamage: ${damage.damage}`)
        } else {
          console.log(`${_.capitalize(unit.name)}'s shot misses ${_.capitalize(target.name)}!`)
          alert(`${_.capitalize(unit.name)}'s shot misses ${_.capitalize(target.name)}!`)
      }       
    }     
  })
}

/**
 * Updates a unit's damage and wounds
 *
 * @param {string} uniqueDesignation -  The unit's name
 * @param {object} damage -  The constructed damage object
 * @requires Unit
 * @requires Database
 * @memberof Game
 * @return {undefined} - Updates the unit directly
 */
function applyDamage(uniqueDesignation, damage) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
      let unit = data.val()
      let pd = Number(unit.physicalDamageTotal)
      let injuries = unit.disablingInjuries
      let newInjuries = injuries += `${damage.wound} to ${damage.location}.\n `
      let status = unit.status

      if (damage.damage >= 1000000) {
        pd = 'dead'
        newInjuries = 'dead'
        alert(`${_.capitalize(unit.name)} is dead!`)
      } else {
        pd += damage.damage
        if (checkIncapacitated(unit, pd) === true) {
          status = 'incapacitated'
          alert(`${_.capitalize(unit.name)} is incapacitated!`)
        }
      }
      
      Unit.update({physicalDamageTotal: pd, disablingInjuries: newInjuries, status: status}, uniqueDesignation)
  })
}

/**
 * Checks for incapacitation
 *
 * @param {object} unit -  The full object for the unit
 * @param {number} newPD -  Just pass the new physical damage here to avoid race conditions with updating database
 * @memberof Game
 * @return {boolean} - True if incapacitated
 */
function checkIncapacitated(unit, newPD) {
    let pd = newPD
    let kv = unit.knockoutValue
    let roll = _.random(1, 100)
    let ic
    let result = false

    if (pd < (kv / 10)) {ic = 0}
    if (pd > (kv / 10)) {ic = 10}
    if (pd > kv) {ic = 25}
    if (pd > (2 * kv)) {ic = 75}
    if (pd > (3 * kv)) {ic = 98}    

    if (roll < ic) {
      result = true
    }

    return result

}

/**
 * Moves a unit to a hex based on user input
 *
* @param {string} uniqueDesignation - The name of the unit
 * @param {number} totalActions - The number of actions used
 * @memberof Game
 * @return {undefined} - Moves the unit
 */
function moveToHex(uniqueDesignation, totalActions) {
  let x = $('#hex-x').val()
  let y = $('#hex-y').val()
  let xNum = Number(x), yNum =  Number(y)
  let point = {x: xNum, y: yNum}

  Unit.animateUnitToHex(point, uniqueDesignation)
}

/**
 * Changes the position to standing
 *
 * @param {string} uniqueDesignation -  The unit's name
 * @param {number} totalActions -  The amount of actions used
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Updates the unit directly
 */
function toStanding(uniqueDesignation, totalActions) {
  Unit.update({position: 'standing'}, uniqueDesignation)
  console.log(`${uniqueDesignation} stands up`)
}

/**
 * Changes the position to kneeling
 *
 * @param {string} uniqueDesignation -  The unit's name
 * @param {number} totalActions -  The amount of actions used
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Updates the unit directly
 */
function toKneeling(uniqueDesignation, totalActions) {
  Unit.update({position: 'kneeling'}, uniqueDesignation)
  console.log(`${uniqueDesignation} kneels`)
}

/**
 * Changes the position to prone
 *
 * @param {string} uniqueDesignation -  The unit's name
 * @param {number} totalActions -  The amount of actions used
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Updates the unit directly
 */
function toProne(uniqueDesignation, totalActions) {
  Unit.update({position: 'prone'}, uniqueDesignation)
  console.log(`${uniqueDesignation} goes prone`)
}

/**
 * Changes facing 1 to the right if in moving
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function face1RightMoving (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'right', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

/**
 * Moves the unit forward 1 hex
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function runningForward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let forwardHex = findNeighbor(unit.currentHex, unit.facing, 'forward')
    Unit.update({currentHex: [forwardHex[0].x, forwardHex[0].y]}, uniqueDesignation)
  })
}

/**
 * Moves the unit backward 1 hex
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function runningBackward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let backwardHex = findNeighbor(unit.currentHex, unit.facing, 'backward')
    Unit.update({currentHex: [backwardHex[0].x, backwardHex[0].y]}, uniqueDesignation)
  })
}

/**
 * Moves the unit forward 1 hex if crawling
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function crawlingForward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let forwardHex = findNeighbor(unit.currentHex, unit.facing, 'forward')
    Unit.update({currentHex: [forwardHex[0].x, forwardHex[0].y]}, uniqueDesignation)
  })
}

/**
 * Moves the unit backward 1 hex if crawling
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function crawlingBackward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let backwardHex = findNeighbor(unit.currentHex, unit.facing, 'backward')
    Unit.update({currentHex: [backwardHex[0].x, backwardHex[0].y]}, uniqueDesignation)
  })
}

/**
 * Moves the unit forward 1 hex if crouching
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function crouchingForward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let forwardHex = findNeighbor(unit.currentHex, unit.facing, 'forward')
    Unit.update({currentHex: [forwardHex[0].x, forwardHex[0].y]}, uniqueDesignation)
  })
}

/**
 * Moves the unit backward 1 hex if crouching
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function crouchingBackward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let backwardHex = findNeighbor(unit.currentHex, unit.facing, 'backward')
    Unit.update({currentHex: [backwardHex[0].x, backwardHex[0].y]}, uniqueDesignation)
  })
}

/**
 * Changes facing 1 to the left if immobile
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function face1LeftImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'left', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

/**
 * Changes facing 1 to the right if immobile
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function face1RightImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'right', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

/**
 * Changes facing 2 to the left if immobile
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function face2LeftImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'left', 2)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

/**
 * Changes facing 2 to the right if immobile
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function face2RightImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'right', 2)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

/**
 * Changes unit's stance to firing
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Unit
 * @memberof Game
 * @return {undefined} - Modifies the database directly
 */
function assumeFiringStance (uniqueDesignation) {
  Unit.update({position: 'firing'}, uniqueDesignation)
}

function lookOverCover (uniqueDesignation) {
  console.log('looking over cover')
}

function throwGrenade (uniqueDesignation) {

}

function openDoor (uniqueDesignation) {

}

function openWindow (uniqueDesignation) {

}

function reloadWeapon (uniqueDesignation) {

}

function loadMagazine (uniqueDesignation) {

}

function dropWeapon (uniqueDesignation) {

}

function deployBipod (uniqueDesignation) {

}

function climbWindow (uniqueDesignation) {

}

function drawPistolShoulder (uniqueDesignation) {

}

function drawPistolHip (uniqueDesignation) {

}

function drawHandWeapon (uniqueDesignation) {

}

function accessBackpack (uniqueDesignation) {

}
console.log(checkIncapacitated('dingo'))
module.exports = {
  face1LeftMoving: face1LeftMoving,
  face1RightMoving: face1RightMoving,
  runningForward: runningForward,
  runningBackward: runningBackward,
  crawlingForward: crawlingForward,
  crawlingBackward: crawlingBackward,
  crouchingForward: crouchingForward,
  crouchingBackward: crouchingBackward,
  face1LeftImmobile: face1LeftImmobile,
  face1RightImmobile: face1RightImmobile,
  face2LeftImmobile: face2LeftImmobile,
  face2RightImmobile: face2RightImmobile,
  assumeFiringStance: assumeFiringStance,
  lookOverCover: lookOverCover,
  throwGrenade: throwGrenade,
  openDoor: openDoor,
  openWindow: openWindow,
  reloadWeapon: reloadWeapon,
  loadMagazine: loadMagazine,
  dropWeapon: dropWeapon,
  deployBipod: deployBipod,
  climbWindow: climbWindow,
  drawPistolShoulder: drawPistolShoulder,
  drawPistolHip: drawPistolHip,
  drawHandWeapon: drawHandWeapon,
  accessBackpack: accessBackpack,
  aiming: aiming,
  toStanding: toStanding,
  toKneeling: toKneeling,
  toProne: toProne,
  takeCover: takeCover,
  moveToHex: moveToHex
}

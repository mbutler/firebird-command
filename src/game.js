/**
 * This module handles primary game logic
 * @module Game
 */

let Database = require('./database')
let config = require('./config')
let Unit = require('./unit')
let Map = require('./map')
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
  let currentHex = Map.getHexFromPoint(currentCoords)
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
 * Gets a list of all all unit names in a radius from a coordinate
 *
 * @param {array} coords - A point occupied by the target
 * @requires Map
 * @memberof Game
 * @return {array} - An array of unit names
 */
function getUnitsInRadius(coords, range) {
  let neighbors = Map.coordsRange(coords, range)
  _.forEach(neighbors, (hex) => {
      hex.selected = true
      hex.highlight()
  })
  let unitList = []

  _.forEach(neighbors, (hex) => {
    if (hex.currentUnit !== undefined) {
      unitList.push(hex.currentUnit)
    }
  })

  return unitList
}

/**
 * Changes facing 1 to the left if in moving
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @see Actions.action - part of the action submission process
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
 * @see Actions.action - part of the action submission process
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
 * @param {any} msg - A message from the submitAction execution
 * @requires Database
 * @requires Weapons
 * @memberof Game
 * @see Actions.action - part of the action submission process
 * @return {undefined} - Modifies the database directly
 */
function aiming (uniqueDesignation, totalActions, msg, userID) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let weapon = unit.weapons[0]
    let rof = weapon.rateOfFire
    let rounds = unit.currentAmmo
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
    let sweep = $('#sweep').is(":checked")
    let unitsHit = []

    if (rounds <= 0) {
      Database.messages.push(`${_.capitalize(unit.name)} is out of ammo!`)
      return
    }

    if (unit.currentAmmo < rof) {
      rof = unit.currentAmmo
    }
  
    if (aimTime > aimTimeMods.length - 1) {
      aimTime = aimTimeMods.length - 1
    }

    if (totalActions === 1) {
      penalty = -6
    }

    if (weapon.automatic === true) {
      aimTime += 1
      damageMultiplier = Tables.autoFire(rof, range)
    }

    rounds -= rof

    if (weapon.explosive === true) {
      let success = false
      Database.singleUnit(target).once('value').then((data) => {
        shotAccuracy = aimTimeMods[aimTime] + sal + getShooterPositionModifier(unit.position) + penalty + 12
        odds = Tables.oddsOfHitting(shotAccuracy, range)
        if (odds <= roll) {success = true}
        let constructedRoll = {success: success, odds: odds, accuracy: shotAccuracy}
        explosion(target.currentHex, constructedRoll, 'frag-grenade')
      })      
    }

    if (weapon.automatic === true && sweep === true) {
      Database.singleUnit(target).once('value').then((data) => {
        Unit.update({currentAmmo: rounds}, unit.name)
        let victim = data.val()
        unitsHit = getUnitsInRadius(victim.currentHex, 1)
        Database.allUnits.once('value').then((snapshot) => {
          let allUnits = snapshot.val()
          _.forEach(allUnits, (guy) => {
            if (_.includes(unitsHit, guy.name)) {              
              let newTarget = guy
              let targetArmor = Utils.getArmor(newTarget.bodyArmor)
              shotAccuracy = aimTimeMods[aimTime] + sal + getShooterPositionModifier(unit.position) + penalty + getTargetModifiers(newTarget)
              odds = Tables.oddsOfHitting(shotAccuracy, range)
              if (roll <= odds) {
                response = "hit"
                damage = Tables.hitResult(targetArmor, weapon, newTarget.cover)
                damage.damage = damage.damage * damageMultiplier
                applyDamage(newTarget.name, damage)
                Database.messages.push(`${_.capitalize(unit.name)} hits ${_.capitalize(newTarget.name)}, ${damage.status}, ${damage.wound}\nlocation: ${damage.location}\ndamage: ${damage.damage}`)
              } else {
                Database.messages.push(`${_.capitalize(unit.name)}'s shot misses ${_.capitalize(newTarget.name)}!`)
              }          
            }
          })
        })
      })
    }
    
    if (sweep === false && weapon.explosive === false) {
      Database.singleUnit(target).once('value').then((data) => {
        Unit.update({currentAmmo: rounds}, unit.name)
        let target = data.val()
        let targetArmor = Utils.getArmor(target.bodyArmor)
        shotAccuracy = aimTimeMods[aimTime] + sal + getShooterPositionModifier(unit.position) + penalty + getTargetModifiers(target)
        odds = Tables.oddsOfHitting(shotAccuracy, range)    
        if (roll <= odds) {
          response = "hit"
          damage = Tables.hitResult(targetArmor, weapon, target.cover)
          damage.damage = damage.damage * damageMultiplier
          applyDamage(target.name, damage)
          Database.messages.push(`${_.capitalize(unit.name)} hits ${_.capitalize(target.name)}, ${damage.status}, ${damage.wound}\nlocation: ${damage.location}\ndamage: ${damage.damage}`)
        } else if (weapon.explosive === true) {
          Database.messages.push(`${_.capitalize(unit.name)}'s shot misses ${_.capitalize(target.name)}!`)
        }        
      })
    }      
  })
}

// roll = {success: false, odds: 87, accuracy: 67 }
function explosion (coords, roll, type) {
  if (roll.success === false) {
    let offset = Tables.hexOffsetForMissedShot(roll.odds, roll.accuracy)    
    let offsetX = offset * _.sample([1, -1])
    let offsetY = offset * _.sample([1, -1])
    coords = [coords[0] + offsetX, coords[1] + offsetY]
  }

  let impact = Map.getHexFromPoint(coords)
  
  let unitsInBlast = getUnitsInRadius(coords, 6)
  Database.allUnits.once('value').then((snapshot) => {
    let allUnits = snapshot.val()
    _.forEach(allUnits, (guy) => {
      if (_.includes(unitsInBlast, guy.name)) {
        let prone = false
        let pd = guy.physicalDamage
        let damageTotal = guy.damage
        if (guy.position === 'prone') {prone = true}
        let hex = Unit.getUnitHex(guy.name)
        let distance = (Math.abs(impact.q - hex.q) + Math.abs(impact.s - hex.s) + Math.abs(impact.r - hex.r)) / 2        
        let damage = Tables.concussion(type, distance, guy.cover, prone)
        if ((pd + damage) >= 1000000) {
          pd = 1000000
          newInjuries = 'dead'
          status = 'dead'
          Database.messages.push(`${_.capitalize(guy.name)} is ${status}!`)
        } else {
          pd += damage
          damageTotal += _.round((pd * 10) / guy.health)
          if (checkIncapacitated(guy, pd) === true) {
            status = 'incapacitated'
            Database.messages.push(`${_.capitalize(guy.name)} is ${status}!`)
          }
          checkMedicalAid(guy, damageTotal, 'no aid')
        }
        console.log('damage', guy.name, damage)
        Unit.update({physicalDamage: damage, status: status, damage: damageTotal}, guy.name)        
      }
    })
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
      let health = unit.health
      let pd = Number(unit.physicalDamage)
      let injuries = unit.disablingInjuries
      let newInjuries = injuries += `${damage.wound} to ${damage.location}.\n `
      let status = unit.status
      let damageTotal = unit.damage

      if (damage.damage >= 1000000) {
        pd = 1000000
        newInjuries = 'dead'
        status = 'dead'
        Database.messages.push(`${_.capitalize(unit.name)} is ${status}!`)
      } else {
        pd += Number(damage.damage)
        damageTotal += _.round((pd * 10) / health)
        if (checkIncapacitated(unit, pd) === true) {
          status = 'incapacitated'
          Database.messages.push(`${_.capitalize(unit.name)} is ${status}!`)
        }
        checkMedicalAid(unit, damageTotal, 'no aid')
      }
            
      Unit.update({physicalDamage: pd, disablingInjuries: newInjuries, status: status, damage: damageTotal}, uniqueDesignation)
  })
}


/**
 * checks the medical aid and recovery chart and submits to action list if needed
 *
 * @param {object} unit -  The unit being checked
 * @param {number} dt -  Unit's damage total
 * @param {string} aid -  The aid type. 'no aid', 'first aid', hospital', 'trauma center'
 * @requires Tables
 * @return {undefined} - Submit's through a global function
 */
function checkMedicalAid(unit, dt, aid) {
  let combatActions = unit.combatActions
  let aidResult = Tables.medical(dt, aid)
  //convert time into combat actions
  let time = _.round((aidResult.ctp / 4) * unit.combatActions)
  window.submitAction('medical-aid', unit.name, time, aidResult.rr, config.userID)
}

/**
 * Checks the recovery roll
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @param {number} totalActions - The number of actions used for the aim
 * @param {any} msg - A message from the submitAction execution
 * @requires Database
 * @requires Unit
 * @memberof Game
 * @see Actions.action - part of the action submission process
 * @return {undefined} - Modifies the database directly
 */
function medicalAid(uniqueDesignation, totalActions, msg, userID) {
  let rr = msg
  let roll = _.random(1, 100)
  let status = 'alive'

  if (roll > rr) {
    status = 'dead'
    Unit.update({physicalDamage: 1000000, disablingInjuries: 'dead', status: status}, uniqueDesignation)
  }

  Database.messages.push(`${_.capitalize(uniqueDesignation)} is ${status}!`)  

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
function moveToHex(uniqueDesignation, totalActions, msg, userID) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let x = $('#hex-x').val()
    let y = $('#hex-y').val()
    let point
       
    point = [Number(x), Number(y)]
    Unit.update({currentHex: point}, uniqueDesignation)

        
  })
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
function toStanding(uniqueDesignation, totalActions, msg, userID) {
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
function toKneeling(uniqueDesignation, totalActions, msg, userID) {
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
function toProne(uniqueDesignation, totalActions, msg, userID) {
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
 * @see Actions.action - part of the action submission process
 * @return {undefined} - Modifies the database directly
 */
function runningForward (uniqueDesignation, totalActions, msg, userID) {
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
 * @see Actions.action - part of the action submission process
 * @return {undefined} - Modifies the database directly
 */
function runningBackward (uniqueDesignation, totalActions, msg, userID) {
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
function crawlingForward (uniqueDesignation, totalActions, msg, userID) {
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
function crawlingBackward (uniqueDesignation, totalActions, msg, userID) {
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
function crouchingForward (uniqueDesignation, totalActions, msg, userID) {
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
function crouchingBackward (uniqueDesignation, totalActions, msg, userID) {
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
function face1LeftImmobile (uniqueDesignation, totalActions, msg, userID) {
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
function face1RightImmobile (uniqueDesignation, totalActions, msg, userID) {
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
function face2LeftImmobile (uniqueDesignation, totalActions, msg, userID) {
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
function face2RightImmobile (uniqueDesignation, totalActions, msg, userID) {
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
function assumeFiringStance (uniqueDesignation, totalActions, msg, userID) {
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
  moveToHex: moveToHex,
  medicalAid: medicalAid,
  getUnitsInRadius: getUnitsInRadius,
  explosion: explosion
}
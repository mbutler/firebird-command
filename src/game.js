/**
 * This module handles primary game logic
 * @module js/game
 */

let Database = require('./database')
let config = require('./config')
let Unit = require('./unit')
let Map = require('./map')
let _ = require('lodash')

/**
 * Wraps an array index around the end of an array like a loop
 *
 * @param {number} m - An array length
 * @param {number} n - An offset from current index
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
 * Looks ahead and finds a hex based on a given face
 *
 * @param {object} currentCoords -  A point object of the current position
 * @param {number} facing - The face number the unit is looking towards, 0-5
 * @param {string} neighbor - The direction to find. 'forward', 'backward', or two-letter direction
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

function face1LeftMoving (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'left', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

function face1RightMoving (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'right', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

function runningForward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let forwardHex = findNeighbor(unit.currentHex, unit.facing, 'forward')
    Unit.update({currentHex: [forwardHex[0].x, forwardHex[0].y]}, uniqueDesignation)
  })
}

function runningBackward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let backwardHex = findNeighbor(unit.currentHex, unit.facing, 'backward')
    Unit.update({currentHex: [backwardHex[0].x, backwardHex[0].y]}, uniqueDesignation)
  })
}

function crawlingForward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let forwardHex = findNeighbor(unit.currentHex, unit.facing, 'forward')
    Unit.update({currentHex: [forwardHex[0].x, forwardHex[0].y]}, uniqueDesignation)
  })
}

function crawlingBackward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let backwardHex = findNeighbor(unit.currentHex, unit.facing, 'backward')
    Unit.update({currentHex: [backwardHex[0].x, backwardHex[0].y]}, uniqueDesignation)
  })
}

function crouchingForward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let forwardHex = findNeighbor(unit.currentHex, unit.facing, 'forward')
    Unit.update({currentHex: [forwardHex[0].x, forwardHex[0].y]}, uniqueDesignation)
  })
}

function crouchingBackward (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let backwardHex = findNeighbor(unit.currentHex, unit.facing, 'backward')
    Unit.update({currentHex: [backwardHex[0].x, backwardHex[0].y]}, uniqueDesignation)
  })
}

function face1LeftImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'left', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

function face1RightImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'right', 1)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

function face2LeftImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'left', 2)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

function face2RightImmobile (uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let newFace = findFace(unit.facing, 'right', 2)

    Unit.update({facing: newFace}, uniqueDesignation)
  })
}

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
  accessBackpack: accessBackpack
}

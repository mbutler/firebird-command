let Database = require('./database')
let config = require('./config')
let Unit = require('./unit')
let Map = require('./map')
let _ = require('lodash')

function wrap (m, n) {
  return n >= 0 ? n % m : (n % m + m) % m
}

function findFace (current, direction, amount) {
  let faces = _.range(0, 6)

  if (direction === 'left') return wrap(faces.length, (current - amount))
  if (direction === 'right') return wrap(faces.length, (current + amount))
}

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

module.exports = {
  face1LeftMoving: face1LeftMoving,
  face1RightMoving: face1RightMoving,
  runningForward: runningForward
}

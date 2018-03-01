let Database = require('./database')
let config = require('./config')
let Unit = require('./unit')
let _ = require('lodash')

function findFace (current, direction, amount) {
    let face
    if (direction == 'left') {
        face = current - amount
        if (face <= -1) {
            face = 5
        }
    }

    if (direction == 'right') {
        face = current + amount
        if (face >= 6) {
            face = 0
        }
    }

    return face
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

module.exports = {
    face1LeftMoving: face1LeftMoving,
    face1RightMoving: face1RightMoving
}
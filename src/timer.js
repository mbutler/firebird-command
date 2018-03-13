/**
 * This module handles game time in increments of phase and impulse
 * @module js/timer
 */

let Database = require('./database')
let _ = require('lodash')
let Action = require('./actions')

/**
 * Advances the game timer one impulse
 *
 * @return {undefined} - Modifies the database directly
 */
function incrementTimer() {
    Database.time.once('value').then((snapshot) => {
        let time = snapshot.val()
        let phase = time.phase
        let impulse = time.impulse
        let next = {}

        if (impulse === 4) {
            phase += 1
            impulse = 1
        } else {
            impulse += 1
        }

        next.impulse = impulse
        next.phase = phase

        Database.time.update(next)
    })
}

/**
 * Reads all stored actions in database action list then executes any that match current game time
 *
 * @return {undefined} - Modifies the database directly
 */
function runActions () {
    Database.time.once('value').then((snapshot) => {
        let currentTime = snapshot.val()
        Database.actionList.once('value').then((snapshot) => {
            let actionList = snapshot.val()
            //get a list of firebase keys for each child in actionList
            var actionKeys = Object.keys(actionList)
            //keep track of the index
            let i = 0

            _.forEach(actionList, (unit) => {
                let unitKey = actionKeys[i]
                let actionTime = unit.time

                //if the unit's action time is the same as current time then run and delete the action from the list
                if (_.isEqual(actionTime, currentTime)) {
                    Action(unit.action, unit.uniqueDesignation)
                    Database.actionList.child(unitKey).remove()
                }
                //increment actionKeys index
                i++
            })
        })
    })    
}

/**
 * Creates the graphical elements of a unit, adds to DOM, and adds events

 * @param {object} action - An action object to store. e.g. {uniqueDesignation: 'snake', time: {phase: 1, impulse: 2}, action: 'face-1-left-moving'}
 * @return {undefined} - Modifies the database directly
 */
function addToActionList (action) {
    Database.actionList.push(action)
}

module.exports = {
    incrementTimer: incrementTimer,
    runActions: runActions,
    addToActionList: addToActionList
}
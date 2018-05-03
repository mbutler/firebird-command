/**
 * This module handles game time in increments of phase and impulse
 * @module Timer
 * @namespace
 */

let Database = require('./database')
let _ = require('lodash')
let Action = require('./actions')
let Unit = require('./unit')

/**
 * Advances the game timer one impulse
 * @requires Database
 * @memberof Timer
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
        console.log(next)
    })
}


/**
 * Adds a specified number of actions to the current game time to determine the correct phase and impulse in the future
 *
 * @param {number} combatActions - A number of combat actions
 * @param {object} unit - The database value of the unit
 * @param {object} time - The database value of the game time
 * @memberof Timer
 * @return {object} - Returns an object with a correct time object as well as remaining actions {time: next, remaining: actions}
 */
function calculateActionTime(combatActions, unit, time) {
    let actions = combatActions
    let ca = unit.combatActionsPerImpulse
    let next = time
    let phase = time.phase
    let impulse = time.impulse
    let i = 0
    
    ca.shift() // there's an undefined value in index 0 for some reason 

    //while there are still total actions at each impulse
    while (actions >= ca[i]) {
        //subtract the impulse's actions from total actions
        actions = actions - ca[i]
        i++

        //there are only 4 impulses per phase, so loop around
        if (i === 4) {
            i = 0
        }

        //only increment the time if there are actions left
        if (actions > 0) {
            if (impulse === 4) {
                phase += 1
                impulse = 1
            } else {
                impulse += 1
            }

            next.impulse = impulse
            next.phase = phase
        }
    }
    //subtract the impulse amount from actions to get remaining
    return {time: next, remaining: ca[impulse] - actions}
}

/**
 * Returns a specified unit as well as the currernt time
 * @requires Database
 * @requires Action
 * @memberof Timer
 * @return {array} - Returns an array of the unit object and time object
 */
async function getTimeAndUnit (uniqueDesignation) {
    let singleUnit = Database.singleUnit(uniqueDesignation).once('value')
    let currentTime = Database.time.once('value')
    let values = await Promise.all([singleUnit, currentTime])
    let unit = values[0].val()
    let time = values[1].val()
    
    return [unit, time]
}

/**
 * Reads all stored actions in database action list then executes any that match current game time
 * @requires Database
 * @requires Action
 * @memberof Timer
 * @return {undefined} - Modifies the database directly
 */
function runActions () {
    Database.time.once('value').then((snapshot) => {
        let currentTime = snapshot.val()
        Database.actionList.once('value').then((snapshot) => {
            let actionList = snapshot.val()
            console.log(actionList)

            //make sure there is an Action List
            if (actionList !== null) {
                 //get a list of firebase keys for each child in actionList
                var actionKeys = Object.keys(actionList)
                //keep track of the index
                let i = 0

                _.forEach(actionList, (unit) => {
                    console.log(unit)
                    let unitKey = actionKeys[i]
                    let actionTime = unit.time

                    //if the unit's action time is the same as current time then run and delete the action from the list
                    if (_.isEqual(actionTime, currentTime)) {
                        console.log("actions running")                 
                        Action.action(unit.action, unit.uniqueDesignation)
                        Database.actionList.child(unitKey).remove()
                    }
                    //increment actionKeys index
                    i++
                })
            }           
        })
    })    
}

/**
 * Adds an action object to the database's action list

 * @param {object} action - An action object to store. e.g. {uniqueDesignation: 'snake', time: {phase: 1, impulse: 2}, action: 'face-1-left-moving'}
 * @requires Database
 * @memberof Timer
 * @return {undefined} - Modifies the database directly
 */
function addToActionList (action) {
    let uniqueDesignation = action.uniqueDesignation
    Database.actionList.push(action)
}

/**
 * Constructs the proper object to submit to addToActionList
 * @param {string} uniqueDesignation - The unit's name
 * @param {string} actionName - The action's name
 * @requires Action
 * @memberof Timer
 * @see Utils.createButtonSet - Called from generated buttons
 * @return {undefined} - Runs addToActionList directly
 */
function submitAction (actionName, uniqueDesignation, ca) {
    let sample = getTimeAndUnit(uniqueDesignation)
    sample.then((data) => {
        let unit = data[0]
        let time = data[1]
        //let ca = Action.getActionCost(actionName)
        let result = calculateActionTime(ca, unit, time)
        let next = result.time
        let remain = result.remaining
        let action = {uniqueDesignation: uniqueDesignation, time: next, action: actionName, remainingActions: remain}
        addToActionList(action)
    })
}

//make submission function available from the DOM
window.submitAction = submitAction

module.exports = {
    getTimeAndUnit: getTimeAndUnit,
    calculateActionTime: calculateActionTime,
    incrementTimer: incrementTimer,
    runActions: runActions,
    addToActionList: addToActionList,
    submitAction: submitAction
}
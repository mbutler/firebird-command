/**
 * This module handles game time in increments of phase and impulse
 * @module Timer
 * @namespace
 */

let Database = require('./database')
let _ = require('lodash')
let Action = require('./actions')
let Unit = require('./unit')
let Utils = require('./utils')
let config = require('./config')

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
    let ca = unit.currentActionsPerImpulse
    let next = time
    let phase = time.phase
    let impulse = time.impulse
    let i = impulse

    //while there are still total actions at each impulse
    while (actions >= ca[i]) {
        //subtract the impulse's actions from total actions
        actions = actions - ca[i]
        i++

        //there are only 4 impulses per phase, so loop around
        if (i > 4) {
            i = 1
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

    if (combatActions === 0) {
        actions = unit.currentActionsPerImpulse[time.impulse]
    }
    
    //subtract the impulse amount from actions to get remaining
    return {time: next, remaining: actions}
}

/**
 * Returns a specified unit as well as the current time
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

            //make sure there is an Action List
            if (actionList !== null) {
                 //get a list of firebase keys for each child in actionList
                var actionKeys = Object.keys(actionList)
                //keep track of the index
                let i = 0

                _.forEach(actionList, (unit) => {
                    let unitKey = actionKeys[i]
                    let actionTime = unit.time

                    //if the unit's action time is the same as current time then run and delete the action from the list
                    if (_.isEqual(actionTime, currentTime)) {
                        Database.singleUnit(unit.uniqueDesignation).once('value').then((data) => {
                            if (config.userID == unit.userID) {
                                let guy = data.val()
                                let currentImpulse = currentTime.impulse
                                let newActionValue = guy.combatActionsPerImpulse
                                newActionValue[currentImpulse] = unit.remainingActions
                                Unit.update({currentActionsPerImpulse: newActionValue}, unit.uniqueDesignation)           
                                Action.action(unit.action, unit.uniqueDesignation, unit.totalActions, unit.msg)
                                Database.actionList.child(unitKey).remove()
                                Utils.populateControlPanel(guy.name)
                            }                            
                        })                        
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
function submitAction (actionName, uniqueDesignation, ca, msg, userID) {
    let sample = getTimeAndUnit(uniqueDesignation)
    sample.then((data) => {
        let unit = data[0]
        let time = data[1]
        let result = calculateActionTime(ca, unit, time)
        let next = result.time
        let remain = result.remaining
        let action = {uniqueDesignation: uniqueDesignation, time: next, action: actionName, remainingActions: remain, totalActions: ca, msg: msg, userID: userID}
                
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
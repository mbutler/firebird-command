/**
 * This module handles mapping a string input to an action function
 * @module Actions
 * @namespace
 */
let Game = require('./game')

/**
 * Map to the action functions in the Game module
 *
 * @param {string} selection - A unique name for the action
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Game
 * @memberof Actions
 * @return {undefined} - Runs a function directly
 */
function action(selection, uniqueDesignation) {
    let actionMap = {
        'face-1-left-moving': Game.face1LeftMoving,
        'face-1-right-moving': Game.face1RightMoving,
        //
        'crawling-forward': Game.crawlingForward,
        'crawling-backward': Game.crawlingBackward,
        //
        'crouching-forward': Game.crouchingForward,
        'crouching-backward': Game.crawlingBackward,
        //
        'running-forward': Game.runningForward,
        'running-backward': Game.runningBackward,
        //
        'face-1-left-immobile': Game.face1LeftImmobile,
        'face-2-left-immobile': Game.face2LeftImmobile,
        'face-1-right-immobile': Game.face1RightImmobile,
        'face-2-right-immobile': Game.face2RightImmobile,
        //
        'assume-firing-stance': Game.assumeFiringStance,
        'look-over-cover': Game.lookOverCover,
        'throw-grenade': Game.throwGrenade,
        'open-door': Game.openDoor,
        'open-window': Game.openWindow,
        'reload-weapon': Game.reloadWeapon,
        'load-magazine': Game.loadMagazine,
        'drop-weapon': Game.dropWeapon,
        'deploy-bipod': Game.deployBipod,
        'climb-window': Game.climbWindow,
        'draw-pistol-shoulder': Game.drawPistolShoulder,
        'draw-pistol-hip': Game.drawPistolHip,
        'draw-hand-weapon': Game.drawHandWeapon,
        'access-backpack': Game.accessBackpack

    }

    let act = actionMap[selection]
    act(uniqueDesignation)
}

function getActionCost (actionName) {
    let actionCostMap = {
        'face-1-left-moving': 0,
        'face-1-right-moving': 0,
        //
        'crawling-forward': 3,
        'crawling-backward': 5,
        //
        'crouching-forward': 2,
        'crouching-backward': 4,
        //
        'running-forward': 1,
        'running-backward': 1,
        //
        'face-1-left-immobile': 1,
        'face-2-left-immobile': 1,
        'face-1-right-immobile': 1,
        'face-2-right-immobile': 1,
        //
        'assume-firing-stance': 2,
        'look-over-cover': 1,
        'throw-grenade': 2,
        'open-door': 3,
        'open-window': 6,
        'reload-weapon': 8,
        'load-magazine': 4,
        'drop-weapon': 4,
        'deploy-bipod': 8,
        'climb-window': 6,
        'draw-pistol-shoulder': 3,
        'draw-pistol-hip': 2,
        'draw-hand-weapon': 2,
        'access-backpack': 7

    }

    return actionCostMap[actionName]
}

module.exports = {
    action: action,
    getActionCost: getActionCost
}
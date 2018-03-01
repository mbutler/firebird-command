let Game = require('./game')

function action (selection, uniqueDesignation) {
    let actionMap = {
        'face-1-left-moving': Game.face1LeftMoving,
        'face-1-right-moving': Game.face1RightMoving,
        //
        'change-facing-immobile': Game.changeFacingImmobile,
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
        'access-backpack': Game.accessBackpack,
        //
        'running-forward': Game.runningForward,
        'running-backward': Game.runningBackward,
        //
        'crawling-forward': Game.crawlingForward,
        'crawling-backward': Game.crawlingBackward

    }

    let act = actionMap[selection]
    act(uniqueDesignation)
}

module.exports = action
/**
 * This module handles various utility functions
 * @module js/utils
 */
let Database = require('./database')

/**
 * Adds a set of buttons for the specified unit to control actions.
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @return {undefined} - Modifies DOM directly
 */
function createButtonSet(uniqueDesignation) {
    $('#facing-dropdown').empty()
    let face1LeftMoving = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('face-1-left-moving', '${uniqueDesignation}')">Turn 1 hexside left <span class="badge">0</span></a></li>`
    let face1RightMoving = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('face-1-right-moving', '${uniqueDesignation}')">Turn 1 hexside right <span class="badge">0</span></a></li>`
    let face1LeftImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('face-1-left-immobile', '${uniqueDesignation}')">Turn 1 hexside left <span class="badge">1</span></a></li>`
    let face2LeftImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('face-2-left-immobile', '${uniqueDesignation}')">Turn 2 hexside left <span class="badge">1</span></a></li>`
    let face1RightImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('face-1-right-immobile', '${uniqueDesignation}')">Turn 1 hexside right <span class="badge">1</span></a></li>`
    let face2RightImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('face-2-right-immobile', '${uniqueDesignation}')">Turn 2 hexside right <span class="badge">1</span></a></li>`
    
    $('#facing-dropdown').append(face1LeftMoving)
    $('#facing-dropdown').append(face1RightMoving)
    $('#facing-dropdown').append(face1LeftImmobile)
    $('#facing-dropdown').append(face2LeftImmobile)
    $('#facing-dropdown').append(face1RightImmobile)
    $('#facing-dropdown').append(face2RightImmobile)

    Database.singleUnit(uniqueDesignation).once('value').then((data) => {
        let unit = data.val()
        $('#moving-dropdown').empty()

        if (unit.position === 'standing') {
            
            let runningForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('running-forward', '${uniqueDesignation}')">Move forward one hex <span class="badge">1</span></a></li>`
            let runningBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('running-backward', '${uniqueDesignation}')">Move backward one hex <span class="badge">2</span></a></li>`
            
            $('#moving-dropdown').append(runningForward)
            $('#moving-dropdown').append(runningBackward)
        } else if (unit.position === 'kneeling') {
            let crouchingForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('crouching-forward', '${uniqueDesignation}')">Move forward one hex <span class="badge">2</span></a></li>`
            let crouchingBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('crouching-backward', '${uniqueDesignation}')">Move backward one hex <span class="badge">4</span></a></li>`

            $('#moving-dropdown').append(crouchingForward)
            $('#moving-dropdown').append(crouchingBackward)
        } else if (unit.position === 'prone') {
            let crawlingForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('crawling-forward', '${uniqueDesignation}')">Move forward one hex <span class="badge">3</span></a></li>`
            let crawlingBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('crawling-backward', '${uniqueDesignation}')">Move backward one hex <span class="badge">5</span></a></li>`

            $('#moving-dropdown').append(crawlingForward)
            $('#moving-dropdown').append(crawlingBackward)
        }
    })
}

/**
 * Adds a specified number of actions to the current game time to determine the correct phase and impulse in the future
 *
 * @param {number} actions - A number of combat actions
 * @param {string} uniqueDesignation - The name of the unit
 * @return {object} - Returns an object with a correct time object as well as remaining actions {time: next, remaining: actions}
 */
function calculateActionTime(actions, uniqueDesignation) {
    Database.singleUnit(uniqueDesignation).once('value').then((data) => {
        let unit = data.val()
        let ca = unit.combatActionsPerImpulse
        ca.shift() // there's an undefined value in index 0 for some reason
        Database.time.once('value').then((snapshot) => {
            let time = snapshot.val()
            let next = time
            let phase = time.phase
            let impulse = time.impulse
            let i = 0

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
            //need to update here
            console.log(next)
            console.log('remaining actions at run time: ', actions)
            //returns {time: next, remaining: actions}
        })
    })
}

/**
 * Reads values from database and populates the control panel forms
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @return {undefined} - Inserts values directly into the DOM
 */
function populateControlPanel(uniqueDesignation) {
    Database.singleUnit(uniqueDesignation).once('value').then((data) => {
        let unit = data.val()
        $('#panelUniqueDesignation h3').html(uniqueDesignation)
        $('#skill-level').html(unit.skillLevel)
        $('#strength').html(unit.strength)
        $('#intelligence').html(unit.intelligence)
        $('#will').html(unit.will)
        $('#health').html(unit.health)
        $('#agility').html(unit.agility)
        $('#base-speed').html(unit.baseSpeed)
        $('#maximum-speed').html(unit.maximumSpeed)
        $('#gun-combat-skill-level').html(unit.gunCombatSkillLevel)
        $('#skill-accuracy-level').html(unit.skillAccuracyLevel)
        $('#int-skill-factor').html(unit.intSkillFactor)
        $('#combat-actions').html(unit.combatActions)
        $('#impulse1').html(unit.combatActionsPerImpulse['1'])
        $('#impulse2').html(unit.combatActionsPerImpulse['2'])
        $('#impulse3').html(unit.combatActionsPerImpulse['3'])
        $('#impulse4').html(unit.combatActionsPerImpulse['4'])
        $('#knockout-value').html(unit.knockoutValue)
    })
}

module.exports = {
    calculateActionTime: calculateActionTime,
    populateControlPanel: populateControlPanel,
    createButtonSet: createButtonSet
}
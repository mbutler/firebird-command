/**
 * This module handles various utility functions
 * @module Utils
 * @namespace
 */
let Database = require('./database')

/**
 * Adds a set of buttons for the specified unit to control actions.
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @memberof Utils
 * @see Unit.create - Calls createButtonSet
 * @return {undefined} - Modifies DOM directly
 */
function createButtonSet(uniqueDesignation) {
    $('#facing-dropdown').empty()
    let face1LeftMoving = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('face-1-left-moving', '${uniqueDesignation}', 0)">Turn 1 hexside left <span class="badge">0</span></a></li>`
    let face1RightMoving = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('face-1-right-moving', '${uniqueDesignation}', 0)">Turn 1 hexside right <span class="badge">0</span></a></li>`
    let face1LeftImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('face-1-left-immobile', '${uniqueDesignation}', 1)">Turn 1 hexside left <span class="badge">1</span></a></li>`
    let face2LeftImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('face-2-left-immobile', '${uniqueDesignation}', 1)">Turn 2 hexside left <span class="badge">1</span></a></li>`
    let face1RightImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('face-1-right-immobile', '${uniqueDesignation}', 1)">Turn 1 hexside right <span class="badge">1</span></a></li>`
    let face2RightImmobile = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('face-2-right-immobile', '${uniqueDesignation}', 1)">Turn 2 hexside right <span class="badge">1</span></a></li>`

    $('#facing-dropdown').append(face1LeftMoving)
    $('#facing-dropdown').append(face1RightMoving)
    $('#facing-dropdown').append(face1LeftImmobile)
    $('#facing-dropdown').append(face2LeftImmobile)
    $('#facing-dropdown').append(face1RightImmobile)
    $('#facing-dropdown').append(face2RightImmobile)

    // add aiming mods 1-12
    for (let i = 1; i <= 12; i++) {
        let aiming = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('aiming', '${uniqueDesignation}', ${i})">Aim <span class="badge">${i}</span></a></li>`
        $('#aiming-dropdown').append(aiming)
    }

    Database.singleUnit(uniqueDesignation).once('value').then((data) => {
        let unit = data.val()
        $('#moving-dropdown').empty()

        if (unit.position === 'standing') {
            let runningForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('running-forward', '${uniqueDesignation}', 1)">Run forward one hex <span class="badge">1</span></a></li>`
            let runningBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('running-backward', '${uniqueDesignation}', 2)">Run backward one hex <span class="badge">2</span></a></li>`
            $('#moving-dropdown').append(runningForward)
            $('#moving-dropdown').append(runningBackward)
        } else if (unit.position === 'kneeling') {
            let crouchingForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crouching-forward', '${uniqueDesignation}', 2)">Crouch forward one hex <span class="badge">2</span></a></li>`
            let crouchingBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crouching-backward', '${uniqueDesignation}', 4)">Crouch backward one hex <span class="badge">4</span></a></li>`
            $('#moving-dropdown').append(crouchingForward)
            $('#moving-dropdown').append(crouchingBackward)
        } else if (unit.position === 'prone') {
            let crawlingForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crawling-forward', '${uniqueDesignation}', 3)">Crawl forward one hex <span class="badge">3</span></a></li>`
            let crawlingBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crawling-backward', '${uniqueDesignation}', 5)">Crawl backward one hex <span class="badge">5</span></a></li>`
            $('#moving-dropdown').append(crawlingForward)
            $('#moving-dropdown').append(crawlingBackward)
        }
    })
}



/**
 * Reads values from database and populates the control panel forms
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @memberof Utils
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
        $('#stance').html(unit.stance)
        $('#position').html(unit.position)
        $('#knockout-value').html(unit.knockoutValue)
    })
}

module.exports = {
    populateControlPanel: populateControlPanel,
    createButtonSet: createButtonSet
}
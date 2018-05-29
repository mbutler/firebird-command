/**
 * This module handles various utility functions
 * @module Utils
 * @namespace
 */
let Database = require('./database')
let Weapons = require('./weapons')
let _ = require('lodash')

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
    $('#aiming-dropdown').empty()
    $('#moving-dropdown').empty()
    $('#target-dropdown').empty()
    $('#weapon-table').empty()
    $('#body-armor').empty()
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
        let takeCover = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('take-cover', '${uniqueDesignation}', 0)">Change cover <span class="badge">0</span></a></li>`
        $('#moving-dropdown').append(takeCover)
        if (unit.position === 'standing') {
            let runningForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('running-forward', '${uniqueDesignation}', 1)">Run forward one hex <span class="badge">1</span></a></li>`
            let runningBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('running-backward', '${uniqueDesignation}', 2)">Run backward one hex <span class="badge">2</span></a></li>`
            let toKneeling = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('to-kneeling', '${uniqueDesignation}', 1)">Kneel <span class="badge">1</span></a></li>`
            let toProne = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('to-prone', '${uniqueDesignation}', 2)">Go prone <span class="badge">2</span></a></li>`
            $('#moving-dropdown').append(runningForward)
            $('#moving-dropdown').append(runningBackward)
            $('#moving-dropdown').append(toKneeling)
            $('#moving-dropdown').append(toProne)
        } else if (unit.position === 'kneeling') {
            let crouchingForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crouching-forward', '${uniqueDesignation}', 2)">Crouch forward one hex <span class="badge">2</span></a></li>`
            let crouchingBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crouching-backward', '${uniqueDesignation}', 4)">Crouch backward one hex <span class="badge">4</span></a></li>`
            let toProne = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('to-prone', '${uniqueDesignation}', 1)">Go prone <span class="badge">1</span></a></li>`
            let toStanding = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('to-standing', '${uniqueDesignation}', 1)">Stand up <span class="badge">1</span></a></li>`
            $('#moving-dropdown').append(crouchingForward)
            $('#moving-dropdown').append(crouchingBackward)
            $('#moving-dropdown').append(toProne)
            $('#moving-dropdown').append(toStanding)
        } else if (unit.position === 'prone') {
            let crawlingForward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crawling-forward', '${uniqueDesignation}', 3)">Crawl forward one hex <span class="badge">3</span></a></li>`
            let crawlingBackward = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('crawling-backward', '${uniqueDesignation}', 5)">Crawl backward one hex <span class="badge">5</span></a></li>`
            let toStanding = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('to-standing', '${uniqueDesignation}', 3)">Stand up <span class="badge">3</span></a></li>`
            let toKneeling = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="submitAction('to-kneeling', '${uniqueDesignation}', 2)">Kneel <span class="badge">2</span></a></li>`
            $('#moving-dropdown').append(crawlingForward)
            $('#moving-dropdown').append(crawlingBackward)
            $('#moving-dropdown').append(toStanding)
            $('#moving-dropdown').append(toKneeling)
        }        
    })

    let noTarget = `<li role="presentation" value="none"><a role="menuitem">none</a></li>`
    $('#target-dropdown').append(noTarget)

    Database.allUnits.once('value').then((snapshot) => {
        let units = snapshot.val()
        _.forEach(units, (unit) => {
            let unitListItem = `<li role="presentation" value="${unit.name}"><a role="menuitem">${unit.name}</a></li>`
            $('#target-dropdown').append(unitListItem)
        })
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
        let weapon = Weapons.getWeapon(unit.weapons[0])
        let armor = getArmor(unit.bodyArmor)
        let bodyArmor = `<tr><td class="text-center">${unit.bodyArmor}</td><td id="protection-factor" class="text-center">${armor.pf}</td><td id="armor-weight" class="text-center">${armor.weight}</td></tr>`
        $('#body-armor').append(bodyArmor)
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
        $('#impulse1').html(unit.currentActionsPerImpulse['1'])
        $('#impulse2').html(unit.currentActionsPerImpulse['2'])
        $('#impulse3').html(unit.currentActionsPerImpulse['3'])
        $('#impulse4').html(unit.currentActionsPerImpulse['4'])
        $('#stance').html(unit.stance)
        $('#position').html(unit.position)
        $('#knockout-value').html(unit.knockoutValue)
        $('#weapon-name').html(weapon.name)
        $('#reload-time').html(weapon.reloadTime)
        $('#rate-of-fire').html(weapon.rateOfFire)
        $('#ammunition-capacity').html(weapon.ammoCap)
        $('#ammunition-weight').html(weapon.ammoWeight)
        $('#cover').html(unit.cover)

        for (let i = 1; i <= weapon.aimTime.length-1; i++) {
            let tr = `
                <tr>
                    <td class="text-center">${i}</td>
                    <td id="aim-time-mod-${i}" class="text-center">${weapon.aimTime[i]}</td>
                    <td id="shot-accuracy-${i}" class="text-center">${weapon.aimTime[i] + unit.skillAccuracyLevel}</td>
                </tr>
            `
            $('#weapon-table').append(tr)
        }
    })
}

/**
 * Gets armor data based on name
 *
 * @param {string} armorName - The name of the armor
 * @memberof Utils
 * @return {object} - The armor's data
 */
function getArmor(armorName) {
    let armorValue
    let armor = [
        {name: 'clothing', pf: 0, weight: 5},
        {name: 'light-flexible', pf: 4, weight: 2},
        {name: 'medium-flexible', pf: 6, weight: 2.6},
        {name: 'heavy-flexible', pf: 9, weight: 3.2},
        {name: 'light-rigid', pf: 6, weight: 7.9},
        {name: 'medium-rigid', pf: 16, weight: 15},
        {name: 'heavy-rigid', pf: 30, weight: 24}
    ]

    _.forEach(armor, (val) => {
        if (val.name == armorName) {            
            armorValue = val
        }
    })

    return armorValue
}

module.exports = {
    populateControlPanel: populateControlPanel,
    createButtonSet: createButtonSet,
    getArmor: getArmor
}
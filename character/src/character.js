window.jQuery = window.$ = require('jquery')
const firebase = require('firebase')
const _ = require('lodash')
const bootstrap = require('bootstrap')
const weight = require('./weight')
const speedChart = require('./baseSpeed')
const maxSpeedChart = require('./maxSpeed')
const combatActionChart = require('./combatActions')
const capiChart = require('./combatActionsPerImpulse')

console.log(combatActionChart)

function formSubmit () {
    let encumberance = 0, baseSpeed, maxSpeed, str, agi, sal, isf, ca, ms, combatActions, capi = {}, kv
    let uniqueDesignation = document.getElementById("unique-designation").value
    let skillLevel = document.getElementById("skill-level").value
    let strength = document.getElementById("strength").value
    let intelligence = document.getElementById("intelligence").value
    let will = document.getElementById("will").value
    let health = document.getElementById("health").value
    let agility = document.getElementById("agility").value
    let armor = document.getElementById("armor").value
    let equipmentCheckboxes = document.getElementsByName('equipment')
    let selectedEquipment = []

    for (let i = 0; i < equipmentCheckboxes.length; i++) {
        if (equipmentCheckboxes[i].checked) {
            selectedEquipment.push(equipmentCheckboxes[i].id)
        }
    }
    let weaponCheckboxes = document.getElementsByName('weapon')
    let selectedWeapons = []

    for (let i = 0; i < weaponCheckboxes.length; i++) {
      if (weaponCheckboxes[i].checked) {
          selectedWeapons.push(weaponCheckboxes[i].id)
      }
    }

    encumberance += weight[armor]

    _.forEach(selectedEquipment, (item) => {
        encumberance += weight[item]
    })

    _.forEach(selectedWeapons, (weapon) => {
        encumberance += weight[weapon]
    })

    //round up to nearest 5
    encumberance = Math.ceil(encumberance/5) * 5

    console.log('encumberance', encumberance)

    //table 1A
    _.forEach(speedChart, (col) => {
        if (col.STR == strength) {            
            str = col
        }
    })

    baseSpeed = str[_.toString(encumberance)]

    console.log('base speed', baseSpeed)

    //table 1B
    _.forEach(maxSpeedChart, (col) => {
        if (col.AGI == agility) {
            agi = col
        }
    })

    maxSpeed = agi[_.toString(baseSpeed)]

    console.log('max speed', maxSpeed)

    //curve fitted linear equation just because it's a cool way to do it instead of yet another chart
    //Skill Accuracy Level
    sal = _.round(2147609 + (0.6880844 - 2147609)/(1 + (Number(skillLevel)/1635843000) ** 0.6249486))

    //table 1D
    isf = Number(intelligence) + sal
    isf = 2 * Math.floor(isf / 2) + 1

    console.log('isf', isf)

    _.forEach(combatActionChart, (col) => {
        if (col.MS == maxSpeed) {
            ms = col
        }
    })

    ca = ms[_.toString(isf)]

    console.log('ca', ca)

    //table 1E
    _.forEach(capiChart, (col) => {
        if (col.combatActions == ca) {
            combatActions = col
        }
    })

    capi['1'] = combatActions.impulse1
    capi['2'] = combatActions.impulse2
    capi['3'] = combatActions.impulse3
    capi['4'] = combatActions.impulse4

    console.log('capi', capi)

    //knockout value
    kv = _.round(0.5 * Number(will) * Number(skillLevel))

    console.log('kv', kv)



}



window.formSubmit = formSubmit

module.exports = {
    formSubmit: formSubmit
}
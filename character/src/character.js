window.jQuery = window.$ = require('jquery')
const firebase = require('firebase')
const _ = require('lodash')
const bootstrap = require('bootstrap')
const weight = require('./weight')
const speedChart = require('./baseSpeed')
const maxSpeedChart = require('./maxSpeed')

console.log(maxSpeedChart)

function formSubmit () {
    let encumberance = 0, baseSpeed, maxSpeed, str, agi
    let uniqueDesignation = document.getElementById("unique-designation").value
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

    _.forEach(speedChart, (col) => {
        if (col.STR == strength) {            
            str = col
        }
    })

    baseSpeed = str[_.toString(encumberance)]

    _.forEach(maxSpeedChart, (col) => {
        if (col.AGI == agility) {
            agi = col
        }
    })

    maxSpeed = agi[_.toString(baseSpeed)]

}

window.formSubmit = formSubmit

module.exports = {
    formSubmit: formSubmit
}
window.jQuery = window.$ = require('jquery')
const firebase = require('firebase')
const _ = require('lodash')
const bootstrap = require('bootstrap')
const weight = require('./weight')
const speedChart = require('./baseSpeed')
const maxSpeedChart = require('./maxSpeed')
const combatActionChart = require('./combatActions')
const capiChart = require('./combatActionsPerImpulse')

let config = {
    mapWidth: 100,
    mapHeight: 100,
    hexSize: 25,
    divContainer: 'stage',
    gameID: '-L6D8cz625nLzyargSEO',
    newGame: false,
    firebase: {
      apiKey: 'AIzaSyBKxAP8VRE18XIqhkZlI6z3xbCgaPCwVc0',
      authDomain: 'firebird-f30dc.firebaseapp.com',
      databaseURL: 'https://firebird-f30dc.firebaseio.com',
      projectId: 'firebird-f30dc',
      storageBucket: 'firebird-f30dc.appspot.com',
      messagingSenderId: '274623842874'
    }
  }

  firebase.initializeApp(config.firebase)
  let allUnits = firebase.database().ref('/Games/' + config.gameID + '/Units')

function formSubmit () {
    let newUnit = {}
    let encumberance = 0, baseSpeed, maxSpeed, str, agi, sal, isf, ca, ms, combatActions, capi = {}, kv, symbol = {}
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

    //curve fitted linear equation just because it's a cool way to do it instead of yet another chart
    //Skill Accuracy Level
    sal = _.round(2147609 + (0.6880844 - 2147609)/(1 + (Number(skillLevel)/1635843000) ** 0.6249486))

    //table 1D
    isf = Number(intelligence) + sal
    isf = 2 * Math.floor(isf / 2) + 1

    _.forEach(combatActionChart, (col) => {
        if (col.MS == maxSpeed) {
            ms = col
        }
    })

    ca = ms[_.toString(isf)]

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


    //knockout value
    kv = _.round(0.5 * Number(will) * Number(skillLevel))

    symbol = {
        'sidc': 'SHG-UCFM-------',
        'options': {
          'size': 0,
          'additionalInformation': '',
          'infoFields': false
        }
    }

    newUnit.name = uniqueDesignation
    newUnit.skillLevel = skillLevel
    newUnit.strength = strength
    newUnit.intelligence = intelligence
    newUnit.will = will
    newUnit.health = health
    newUnit.agility = agility
    newUnit.baseSpeed = baseSpeed
    newUnit.maximumSpeed = maxSpeed
    newUnit.skillAccuracyLevel = sal
    newUnit.intSkillFactor = isf
    newUnit.combatActions = ca
    newUnit.combatActionsPerImpulse = capi
    newUnit.knockoutValue = kv
    newUnit.weapons = selectedWeapons
    newUnit.bodyArmor = armor
    newUnit.equipment = selectedEquipment
    newUnit.encumberance = encumberance
    newUnit.symbol = symbol
    newUnit.symbol.options.uniqueDesignation = uniqueDesignation
    newUnit.position = 'standing'
    newUnit.currentHex = [12, 9]
    newUnit.facing = 4
    newUnit.stance = 'running'

    firebase.database().ref('/Games/' + config.gameID + '/Units/' + uniqueDesignation).set(newUnit)

}



window.formSubmit = formSubmit

module.exports = {
    formSubmit: formSubmit
}
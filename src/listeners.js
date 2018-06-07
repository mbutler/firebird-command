/**
 * This module handles all event listeners
 * @module Listeners
 * @namespace
 */

let Database = require('./database')
let Unit = require('./unit')
let config = require('./config')
let Actions = require('./actions')
let Utils = require('./utils')
let Timer = require('./timer')
let _ = require('lodash')

// loading a local version, but keeping the npm module in package.json for now
// https://github.com/timmywil/jquery.panzoom/issues/351#issuecomment-330924963
require('../vendor/jquery.panzoom')
//let panzoom = require('panzoom') //breaks bootstrap tabs 
let area = document.querySelector('#stage')
let Slideout = require('slideout')

controlPanel = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('menu'),
    'padding': 0,
    'duration': 0,
    'tolerance': 0
})

$('.close').on('touchstart mousedown', (e) => {
    controlPanel.close()
})

$('#next-impulse').on('mousedown', (e) => {
    Timer.incrementTimer()
})

//listen for panzooming
//seems insane to use two panzoom libraries, but it works... for now
$('#' + config.divContainer).panzoom({ cursor: 'default' })
//panzoom(area)

//LISTEN FOR UNITS CHANGING STATE
Database.allUnits.on('child_changed', (snapshot) => {
    let unit = snapshot.val()
    let face = unit.facing
    let hex = unit.currentHex
    let uniqueDesignation = snapshot.key
    
    Utils.createButtonSet(uniqueDesignation)
    Utils.populateControlPanel(uniqueDesignation)
    Unit.changeFacing(face, uniqueDesignation)    
    Unit.animateUnitToHex(hex, uniqueDesignation)
    
})

//LISTEN FOR MESSAGES
Database.messages.on('child_added', (data) => {
    let message = data.val()
    let messageKey = data.key
    console.log(message)
    alert(message)    
    Database.messages.child(messageKey).remove()
})

//LISTEN FOR THE TIME TO INCREMENT
Database.time.on('child_changed', (snapshot) => {    
    //whether it's an impulse or a phase
    let timeType = snapshot.ref.path.pieces_[3]

    Database.time.once('value').then((snapshot) => {
        let time = snapshot.val()
        $('#current-time').html(`Phase: ${time.phase}, Impulse: ${time.impulse}`)
    })
    
    Database.allUnits.once('value').then((snapshot) => {
        let units = snapshot.val()
        console.log(units)

        //reset all unit's capi to default
        _.forEach(units, (unit) => {
            let capi = unit.combatActionsPerImpulse
            Unit.update({currentActionsPerImpulse: capi}, unit.name)
        })

        //don't run this if the timeType is phase since it will also run for the impulse change
        if (timeType !== "phase") {
            Timer.runActions()
        }
                
    })
})

//RUN ACTIONS WHEN THE ACTION LIST GETS A NEW CHILD
Database.actionList.on('child_added', (snapshot) => {
    Timer.runActions()
})

$(document).keypress((e) => {
    if (e.which === 84) {
        Timer.incrementTimer()
    }
})

//testing with the space bar
$(document).keypress((e) => {
    if (e.which === 32) {

    }
})
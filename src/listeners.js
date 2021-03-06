/**
 * This module handles all event listeners
 * @module Listeners
 * @namespace
 */

let Database = require('./database')
let Unit = require('./unit')
let Utils = require('./utils')
let Timer = require('./timer')
let _ = require('lodash')
let Game = require('./game')
let Map = require('./map')

let panzoom = require('panzoom')
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

//need to pass in optional function because we DON'T want to preventDefault.
//otherwise, bootstrap nav and buttons won't work
panzoom(area, {
    onTouch: function(e) {
        return false
    },
    smoothScroll: false
})

//LISTEN FOR UNITS CHANGING STATE
Database.allUnits.on('child_changed', (snapshot) => {
    let unit = snapshot.val()
    let face = unit.facing
    let hex = unit.currentHex
    let uniqueDesignation = snapshot.key
    let mapHex = Map.grid.get(unit.currentHex)
    
    //keep these in sync
    mapHex.currentUnit = unit.name
        
    //Utils.createButtonSet(uniqueDesignation)
    Utils.populateControlPanel(uniqueDesignation)
    //Unit.changeFacing(face, uniqueDesignation)    
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
        console.table(Tables.concussion('frag-grenade', 3, false, false))
    }
})

//testing with the space bar
$(document).keypress((e) => {
    if (e.which === 32) {
        let units = Game.explosion([6,8], {success: true, odds: 87, accuracy: 67 }, 'frag-grenade')
        console.log(units)
        
    }
})
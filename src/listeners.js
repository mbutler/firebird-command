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

//listen for panzooming
//seems insane to use two panzoom libraries, but it works... for now
$('#' + config.divContainer).panzoom({ cursor: 'default' })
panzoom(area)

Database.allUnits.on('child_changed', (snapshot) => {
    let unit = snapshot.val()
    let face = unit.facing
    let hex = unit.currentHex
    let uniqueDesignation = snapshot.key

    Unit.changeFacing(face, uniqueDesignation)
    Unit.animateUnitToHex(hex, uniqueDesignation)
})

Database.time.on('child_changed', (snapshot) => {
    let timeType = snapshot.ref.path.pieces_[3]
    //don't really need to get a time snapshot here, but can
    Database.time.once('value').then((snapshot) => {
        let time = snapshot.val()

        //don't run this if the update is phase since it will also run for the impulse change
        if (timeType !== "phase") {
            Timer.runActions()
        }
                
    })
})

Database.actionList.on('child_added', (snapshot) => {
    console.log(snapshot)
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
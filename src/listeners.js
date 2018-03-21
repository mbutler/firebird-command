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

async function testTime (uniqueDesignation) {
    let sample = await Database.time.once('value')
    console.log(sample.val())
}

$(document).keypress((e) => {
    if (e.which === 84) {
        Timer.incrementTimer()
    }
})

//testing with the space bar
$(document).keypress((e) => {
    if (e.which === 32) {

        //Unit.update({currentHex: [6, 9]}, 'panther')
        //Unit.update({currentHex: [15, 9]}, 'dingo')
        //Unit.update({facing: 1}, 'panther')
        //Timer.incrementTimer()
/*         Timer.addToActionList({
            uniqueDesignation: 'snake',
            time: {phase: 1, impulse: 2},
            action: 'face-1-left-moving'
        }) */

        Timer.incrementTimer()
     
        //Timer.incrementTimer()
        
        //Utils.calculateActionTime(13, 'dingo')

        /* Unit.updateUnit({
          agility: 69,
          strength: 20,
          health: 100
        }, 'snake') */
    }
})
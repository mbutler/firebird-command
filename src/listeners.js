let $ = require('jquery')
let Database = require('./database')
let Unit = require('./unit')
let config = require('./config')
let actions = require('./actions')
let MiniSignal = require('mini-signals')
let Utils = require('./utils')

// loading a local version, but keeping the npm module in package.json for now
// https://github.com/timmywil/jquery.panzoom/issues/351#issuecomment-330924963
require('./jquery.panzoom')

let gameTimeSignal = new MiniSignal()

//listen for panzooming
$('#' + config.divContainer).panzoom({ cursor: 'default' })

//listen for any units changing
Database.allUnits.on('child_changed', (snapshot) => {
    let unit = snapshot.val()
    let face = unit.facing
    let hex = unit.currentHex
    let uniqueDesignation = snapshot.key

    Unit.changeFacing(face, uniqueDesignation)
    Unit.animateUnitToHex(hex, uniqueDesignation)
})

Database.time.on('child_changed', (snapshot) => {
    Database.time.once('value').then((snapshot) => {
        let time = snapshot.val()
    })
})

//testing with the space bar
$(document).keypress((e) => {
    if (e.which === 32) {

        //Unit.update({currentHex: [6, 9]}, 'panther')
        //Unit.update({currentHex: [15, 9]}, 'dingo')
        //Unit.update({facing: 1}, 'panther')
        //Utils.incrementTimer()
        Utils.calculateActionTime(13, 'dingo')

        /* Unit.updateUnit({
          agility: 69,
          strength: 20,
          health: 100
        }, 'snake') */
    }
})

module.exports = panel
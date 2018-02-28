let Map = require('./js/map')
let Unit = require('./js/unit')
let _ = require('lodash')
let $ = require('jquery')
let firebase = require('./js/database')
let config = require('./js/config')
let unitList = require('./js/unit-list')
require('./js/listeners')

firebase.unitsDB.once('value').then((snapshot) => {
  let units = snapshot.val()

  _.forEach(units, (unit) => {
    let name = unit.symbol.options.uniqueDesignation
    let face = unit.facing

      // create starting units
    const hex = Map.grid.get(Map.Hex(unit.currentHex))
    unit.symbol.options.size = config.hexSize * 0.8
    Unit.create(hex, unit.symbol.sidc, unit.symbol.options)
    Unit.changeFacing(face, name)
    unitList.unitsToggleList.push(name)
  })
})

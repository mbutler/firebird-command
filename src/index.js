let Map = require('./map')
let Unit = require('./unit')
let _ = require('lodash')
let $ = require('jquery')
let Database = require('./database')
let config = require('./config')
let unitList = require('./unit-list')
require('./listeners')

Database.unitsDB.once('value').then((snapshot) => {
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

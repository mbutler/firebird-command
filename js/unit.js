let firebase = require('./database')
let ms = require('milsymbol')
let $ = require('jquery')
let config = require('./config')
let _ = require('lodash')
let unitList = require('./unit-list')
let Map = require('./map')

function create (hex, sidc, options) {
  let container, symbol, size

    // create div container and svg symbol and set position
  symbol = new ms.Symbol(sidc, options)
  size = symbol.getSize()
  container = createSymbolContainer(options.uniqueDesignation)
  $(container).data('size', size)
  container.innerHTML = symbol.asSVG()
  container = positionUnit(hex, container)

    // store the symbol in the hex
  hex.currentUnit = container

    // add the unit to the DOM and units list
  $('#' + config.divContainer).append(container)

    // store the coordinates of the hex in the unit
  setUnitCoords(hex, options.uniqueDesignation)

  $(container).click((e) => {
    let hex = getUnitHex(e.currentTarget.id)
    if (hex.currentUnit !== undefined) {
      toggleHexSelection(hex)
    }
  })
}

function removeUnitById (uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
    // clear the hex
  let hex = getUnitHex(uniqueDesignation)
  hex.currentUnit = undefined
  unit.parentNode.removeChild(unit)
  $('#' + uniqueDesignation + '-facing').remove()
  _.pull(unitList.unitsToggleList, uniqueDesignation)
}

function getUnitCoords (uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  let point = $.data(unit, 'coords')

  return point
}

function getUnitHex (uniqueDesignation) {
  let coords = getUnitCoords(uniqueDesignation)
  let hex = Map.grid.get(Map.Hex(coords))

  return hex
}

function setUnitCoords (hex, uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  $(unit).data('coords', hex.coordinates())
}

function createSymbolContainer (uniqueDesignation) {
  let div = document.createElement('div')
  div.setAttribute('id', uniqueDesignation)
  div.setAttribute('class', 'unit')

  return div
}

function positionUnit (hex, unit) {
  let hexDiagonal = config.hexSize * 2
  let symbolSize = $.data(unit, 'size')
  let offsetX = (hexDiagonal - symbolSize.width) / 2
  let offsetY = (hexDiagonal - symbolSize.height) / 4

    // need to center it based on symbol's irregular size
  unit.style.position = 'absolute'
  unit.style.left = (hex.screenCoords.x + offsetX) + 'px'
  unit.style.top = (hex.screenCoords.y + offsetY) + 'px'

  return unit
}

function animateUnitToHex (point, uniqueDesignation) {
    // need to query Firebase for the hex that was updated then perform
    // animation and view updates in the callback
    //
  firebase.firebaseRoot.database().ref('/Games/' + config.gameID + '/Units/' + uniqueDesignation).once('value').then((data) => {
    let facing
    let val = data.val()
    facing = val.facing

    const hex = Map.grid.get(point)

    let unit = document.getElementById(uniqueDesignation)

    let symbolSize = $.data(unit, 'size')
    let offsetX = ((config.hexSize * 2) - symbolSize.width) / 2
    let offsetY = ((config.hexSize * 2) - symbolSize.height) / 4

        // clear the previous hex
    let previousHex = getUnitHex(uniqueDesignation)
    previousHex.currentUnit = undefined
    $('#' + uniqueDesignation + '-facing').remove()
    previousHex.selected = false
    previousHex.highlight()

    $('#' + uniqueDesignation).animate({
      'top': (hex.screenCoords.y + offsetY) + 'px',
      'left': (hex.screenCoords.x + offsetX) + 'px'
    }, {
      duration: 500,
      complete: function () {
        $('#' + uniqueDesignation + '-facing').remove()
        setUnitCoords(hex, uniqueDesignation)
        hex.currentUnit = unit
        hex.facing(facing, uniqueDesignation)
      }
    })
  })
}

function changeFacing (face, uniqueDesignation) {
  let hex = getUnitHex(uniqueDesignation)
  $('#' + uniqueDesignation + '-facing').remove()
  hex.facing(face, uniqueDesignation)
}

function update (updates, uniqueDesignation) {
  let changedValue = {}
  let keys = _.keys(updates)

  for (var i = 0; i <= keys.length - 1; i++) {
    changedValue['/' + uniqueDesignation + '/' + keys[i]] = updates[keys[i]]
  }

  firebase.unitsDB.update(changedValue)
}

function toggleHexSelection (hex) {
  _.forEach(unitList.unitsToggleList, (name) => {
    let h = getUnitHex(name)
    h.selected = false
    h.highlight()
  })
  hex.selected = true
  hex.highlight()
}

module.exports = {
  create: create,
  removeUnitById: removeUnitById,
  getUnitCoords: getUnitCoords,
  getUnitHex: getUnitHex,
  setUnitCoords: setUnitCoords,
  animateUnitToHex: animateUnitToHex,
  changeFacing: changeFacing,
  update: update
}

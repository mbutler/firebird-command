function createUnit (hex, sidc, options) {
  let container, symbol
  let size, drawLine
  
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
  //document.body.appendChild(container)
  $('#container').append(container)
  units.push(options.uniqueDesignation)

  // store the coordinates of the hex in the unit
  setUnitCoords(hex, options.uniqueDesignation)

  $(container).mousedown((e) => {
    // check to make sure it's a left button
    if (e.which === 1) {
      let hex = getUnitHex(e.currentTarget.id)
      if (hex.currentUnit !== undefined) {
        selectedUnit = hex.currentUnit
        toggleHexSelection(hex)      
      }   
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
  _.pull(units, uniqueDesignation)
}

function getUnitCoords (uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  let point = $.data(unit, 'coords')

  return point
}

function getUnitHex (uniqueDesignation) {
  let coords = getUnitCoords(uniqueDesignation)
  let hex = grid.get(Hex(coords))

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
  let symbolSize = $.data(unit, 'size')
  let offsetX = (hexDiagonal - symbolSize.width) / 2
  let offsetY = (hexDiagonal - symbolSize.height) / 4

  // need to center it based on symbol's irregular size
  unit.style.position = 'absolute'
  unit.style.left = (hex.screenCoords.x + offsetX) + 'px'
  unit.style.top = (hex.screenCoords.y + offsetY) + 'px'

  return unit
}

function animateUnitToHex (hex, uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  let symbolSize = $.data(unit, 'size')
  let offsetX = (hexDiagonal - symbolSize.width) / 2
  let offsetY = (hexDiagonal - symbolSize.height) / 4

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
      setUnitCoords(hex, uniqueDesignation)
      hex.currentUnit = unit
      hex.facing(unit.facing, uniqueDesignation)
      selectedUnit = hex.currentUnit
      toggleHexSelection(hex)      
    }
  })
}

function changeFacing (face, uniqueDesignation) {
  let hex = getUnitHex(uniqueDesignation)
  let unit = document.getElementById(uniqueDesignation)
  $('#' + uniqueDesignation + '-facing').remove()
  hex.facing(face, uniqueDesignation)
  sheet(uniqueDesignation).facing = face
}

function sheet (uniqueDesignation) {
  return _.find(unitList, (unit) => {return unit.name === uniqueDesignation})
}



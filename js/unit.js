function createUnit (hex, sidc, options) {
  let container, symbol
  let size

  // create div container and svg symbol and set position
  symbol = new ms.Symbol(sidc, options)
  size = symbol.getSize()
  container = createSymbolContainer(options.uniqueDesignation)
  $(container).data('size', size)
  container.innerHTML = symbol.asSVG()
  container = positionUnit(hex, container)

  // store the symbol in the hex
  hex.currentUnit = container

  // add the unit to the DOM
  document.body.appendChild(container)

  // store the coordinates of the hex in the unit
  setUnitCoords(hex, options.uniqueDesignation)
}

function removeUnitById (uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  // clear the hex
  let hex = getUnitHex(uniqueDesignation)
  hex.currentUnit = {}
  unit.parentNode.removeChild(unit)
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
  unit.style.zIndex = -1

  return unit
}

function animateUnitToHex (hex, uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  let symbolSize = $.data(unit, 'size')
  let offsetX = (hexDiagonal - symbolSize.width) / 2
  let offsetY = (hexDiagonal - symbolSize.height) / 4

  // clear the previous hex
  let previousHex = getUnitHex(uniqueDesignation)
  previousHex.currentUnit = {}

  $('#' + uniqueDesignation).animate({
    'top': (hex.screenCoords.y + offsetY) + 'px',
    'left': (hex.screenCoords.x + offsetX) + 'px'
  }, {
    duration: 500,
    complete: function () {
      setUnitCoords(hex, uniqueDesignation)
      hex.currentUnit = unit
    }
  })
}

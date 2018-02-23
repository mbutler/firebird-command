const width = window.innerWidth
const height = window.innerHeight
let hexSize = 25
let hexDiagonal = hexSize * 2
let hexesHorizontal = width / (hexSize + hexSize * 0.5)
let hexesVertical = height / (hexSize + hexSize * 0.5)
const draw = SVG(document.body)



const Hex = Honeycomb.extendHex({
  size: hexSize,
  orientation: 'flat',

  render (draw) {
    const { x, y } = this.toPoint()
    const corners = this.corners()
    this.screenCoords = {'x': x, 'y': y}

    this.draw = draw
    	.polygon(corners.map(({ x, y }) => `${x},${y}`))
      .fill('none')
      .stroke({ width: 1, color: '#D3D3D3' })
      .translate(x, y)
  },

  highlight () {
    this.draw
    	// stop running animation
      .stop(true, true)
      .fill({ opacity: 1, color: 'aquamarine' })
      .animate(150)
      .fill({ opacity: 0, color: 'none' })
  },

  currentUnit: {}
})

const Grid = Honeycomb.defineGrid(Hex)

const grid = Grid.rectangle({
  width: hexesHorizontal,
  height: hexesVertical,
  // render each hex, passing the draw instance
  onCreate (hex) {
    hex.render(draw)
  }
})

document.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'svg' && e.button === 0) {
    const hexCoordinates = Grid.pointToHex([e.offsetX, e.offsetY])
    const hex = grid.get(hexCoordinates)

    if (hex) {
      createUnit(hex, 'SHGPUCIL---C---',
        { size: hexSize * 0.8,
          uniqueDesignation: 'dingo',
          additionalInformation: 'Jones',
          infoFields: false
        })

      hex.highlight()
    }
  }
})

/* document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  if (e.target.tagName !== 'svg') {
    console.log(e.target)
    return false
  }
}, false) */

document.addEventListener('keypress', (event) => {
  if (event.keyCode !== 13) {
    // tests
    const hex = grid.get(Hex(14, 14))
    animateUnitToHex(hex, 'dingo')
    removeUnitById('panther')
  }
}, false)

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

  //store the symbol in the hex
  hex.currentUnit = container

  //add the unit to the DOM
  document.body.appendChild(container)

  //store the coordinates of the hex in the unit
  setUnitCoords(hex, options.uniqueDesignation) 
  
}

function removeUnitById (uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  //clear the hex  
  let hex = getUnitHex(uniqueDesignation)
  hex.currentUnit = {} 
  unit.parentNode.removeChild(unit)
}

function getUnitCoords (uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  let point = $.data(unit, "coords" )

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
  
  //need to center it based on symbol's irregular size
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

  //clear the previous hex
  let previousHex = getUnitHex(uniqueDesignation)
  previousHex.currentUnit = {}  

  $("#" + uniqueDesignation).animate({ 
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

const hex = grid.get(Hex(0, 1))

createUnit(hex, 'SHG-UCFM-------',
        { size: hexSize * 0.8,
          uniqueDesignation: 'panther',
          additionalInformation: 'Barnes',
          infoFields: false
        })

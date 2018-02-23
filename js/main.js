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

  currentSymbol: {}
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
    removeUnitById('panther')
  }
}, false)

function createUnit (hex, sidc, options) {
  console.log(options.uniqueDesignation)
  let container, symbol

  // create div container and svg symbol and set position
  symbol = new ms.Symbol(sidc, options)
  container = createSymbolContainer(options.uniqueDesignation)  
  container.innerHTML = symbol.asSVG()
  container = positionUnit(hex, symbol.getSize(), container)

  //store the coordinates of the hex in the unit
  setUnitPoint(hex, options.uniqueDesignation)
   
  //store the symbol in the hex
  hex.currentSymbol = symbol
  
  //add the unit to the DOM
  document.body.appendChild(container)
}

function removeUnitById (uniqueDesignation) {
  let unit = document.getElementById(uniqueDesignation)
  unit.parentNode.removeChild(unit)
}

function getSymbolPoint (uniqueDesignation) {
  var point = $('#' + uniqueDesignation).data('key')

  return point
}

function setUnitPoint (hex, uniqueDesignation) {
  $('#' + uniqueDesignation).data('key', hex.coordinates())
}

function createSymbolContainer (uniqueDesignation) {
  let div = document.createElement('div')
  div.setAttribute('id', uniqueDesignation)
  
  return div
}

function positionUnit (hex, symbolSize, container) {
  let marker = container
  let offsetX = (hexDiagonal - symbolSize.width) / 2
  let offsetY = (hexDiagonal - symbolSize.height) / 4
  // position the symbol on the screen over the correct hex
  marker.style.position = 'absolute'
  marker.style.left = (hex.screenCoords.x + offsetX) + 'px'
  marker.style.top = (hex.screenCoords.y + offsetY) + 'px'
  marker.style.zIndex = -1

  return marker
}

const hex = grid.get(Hex(0, 1))

createUnit(hex, 'SHGPUCIL---C---',
        { size: hexSize * 0.8,
          uniqueDesignation: 'panther',
          additionalInformation: 'Barnes',
          infoFields: false
        })

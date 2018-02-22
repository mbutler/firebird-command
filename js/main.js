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

document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  if (e.target.tagName !== 'svg') {
    console.log(e.target)
    return false
  }
}, false)

document.addEventListener('keypress', (event) => {
  if (event.keyCode !== 13) {
    // tests
    console.log(getSymbolPoint('dingo'))
  }
}, false)

function createUnit (hex, sidc, options) {
  let icon, symbol

  createSymbolContainer(options.uniqueDesignation)

  icon = document.getElementById(options.uniqueDesignation)

  setSymbolPoint(hex, options.uniqueDesignation)

  symbol = new ms.Symbol(sidc, options)

  hex.currentSymbol = symbol

  positionIcon(hex, symbol.getSize(), icon)

  icon.innerHTML = symbol.asSVG()

}

function getSymbolPoint (uniqueDesignation) {
  var point = $('#' + uniqueDesignation).data('key')

  return point
}

function setSymbolPoint (hex, uniqueDesignation) {
  $('#' + uniqueDesignation).data('key', hex.coordinates())
}

function createSymbolContainer (uniqueDesignation) {
  $('<div/>', {
    id: uniqueDesignation
  })
}

function positionIcon (hex, symbolSize, icon) {
  let marker = icon
  let offsetX = (hexDiagonal - symbolSize.width) / 2
  let offsetY = (hexDiagonal - symbolSize.height) / 4
  // position the symbol on the screen over the correct hex
  marker.style.position = 'absolute'
  marker.style.left = (hex.screenCoords.x + offsetX) + 'px'
  marker.style.top = (hex.screenCoords.y + offsetY) + 'px'
  marker.style.zIndex = -1
}

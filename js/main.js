const width = window.innerWidth
const height = window.innerHeight
var hexSize = 25
var hexDiagonal = hexSize * 2
var hexesHorizontal = width / (hexSize + hexSize * 0.5)
var hexesVertical = height / (hexSize + hexSize * 0.5)
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
      .animate(1000)
      .fill({ opacity: 0, color: 'none' })
  }
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

document.addEventListener('mousedown', ({ offsetX, offsetY }) => {
  const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
  const hex = grid.get(hexCoordinates)

  if (hex) {
    createMilSymbol('SHGPUCIL---C---',
      { size: hexSize * 0.8,
        uniqueDesignation: 'dingo',
        additionalInformation: 'Jones',
        infoFields: false
      }, hex.screenCoords)
    hex.highlight()
  }
})

function createMilSymbol (sidc, options, screenCoords) {
  let icon
  let div = document.createElement('div')
  let render = ''
  let size, offsetX, offsetY
  div.setAttribute('id', options.uniqueDesignation)
  icon = document.getElementById(options.uniqueDesignation)

  let symbol = new ms.Symbol(sidc, options)

  render += symbol.asSVG()

  // calculate the correct offset to center the symbol in the hex
  size = symbol.getSize()
  offsetX = (hexDiagonal - size.width) / 2
  offsetY = (hexDiagonal - size.height) / 4

  // position the symbol on the screen over the correct hex
  icon.style.position = 'absolute'
  icon.style.left = (screenCoords.x + offsetX) + 'px'
  icon.style.top = (screenCoords.y + offsetY) + 'px'
  icon.innerHTML = render
}

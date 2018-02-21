let width = window.innerWidth
let height = window.innerHeight
var map
const app = new PIXI.Application(width, height, { transparent: true, antialias: true })
const graphics = new PIXI.Graphics()

var hexSize = 25
var hexesHorizontal = width / hexSize
var hexesVertical = height / hexSize

const Hex = Honeycomb.extendHex({ size: hexSize, orientation: 'flat' })
const Grid = Honeycomb.defineGrid(Hex)

document.body.appendChild(app.view)
// set a line style of 1px wide and color #999
graphics.lineStyle(1, 0x999999)

// render 10,000 hexes
map = Grid.rectangle({ width: hexesHorizontal, height: hexesVertical }).forEach(hex => {
  const point = hex.toPoint()
    // add the hex's position to each of its corner points
  const corners = hex.corners().map(corner => corner.add(point))
    // separate the first from the other corners
  const [firstCorner, ...otherCorners] = corners

    // move the "pencil" to the first corner
  graphics.moveTo(firstCorner.x, firstCorner.y)
    // draw lines to the other corners
  otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y))
    // finish at the first corner
  graphics.lineTo(firstCorner.x, firstCorner.y)

  app.stage.addChild(graphics)
})


document.addEventListener('click', ({ offsetX, offsetY }) => {
  const hexCoordinates = Grid.pointToHex([offsetX, offsetY])
  console.log(hexCoordinates)
  var hex = Grid.get(hexCoordinates)

  if (hex) {
    console.log(hex)
  }
})

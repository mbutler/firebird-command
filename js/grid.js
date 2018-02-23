const width = window.innerWidth
const height = window.innerHeight
let hexSize = 25
let hexDiagonal = hexSize * 2
let hexesHorizontal = width / (hexSize + hexSize * 0.5)
let hexesVertical = height / (hexSize + hexSize * 0.5)
const draw = SVG(document.body)

function getHexSize () {
  return hexSize
}

const Hex = Honeycomb.extendHex({
  size: hexSize,
  orientation: 'flat',

  render (draw) {
    const { x, y } = this.toPoint()
    const corners = this.corners()
    this.screenCoords = {'x': x, 'y': y}
    this.cornerList = this.corners().map(corner => this.toPoint().add(corner))

    this.draw = draw
    	.polygon(corners.map(({ x, y }) => `${x},${y}`))
      .fill('none')
      .stroke({ width: 1, color: '#E0E0E0' })
      .translate(x, y)
  },

  highlight () {
    this.draw
    	// stop running animation
      //.stop(true, true)
      .fill({ opacity: 1, color: 'aquamarine' })
      .animate(150)
      .fill({ opacity: 0, color: 'none' })
  },

  facing (direction) {
    let faceStart, faceEnd
    switch (direction) {
      case 0:
      // top
        faceStart = 4
        faceEnd = 5
        break
      case 1:
      // top right
        faceStart = 5
        faceEnd = 0
        break
      case 2:
      // bottom right
        faceStart = 0
        faceEnd = 1
        break
      case 3:
      // bottom
        faceStart = 1
        faceEnd = 2
        break
      case 4:
      // bottom left
        faceStart = 2
        faceEnd = 3
        break
      case 5:
      // top left
        faceStart = 3
        faceEnd = 4
        break
      default:
        faceStart = 999
          //
    }
    // 1-2 bottom
    // 2-3 bottom left
    // 3-4 top left
    // 4-5 top
    // 5-0 top right
    // 0-1 bottom right

    /*
    0: {x: 50, y: 21.650635094610966}
    1: {x: 37.5, y: 43.30127018922193}
    2: {x: 12.5, y: 43.30127018922193}
    3: {x: 0, y: 21.650635094610966}
    4: {x: 12.5, y: 0}
    5: {x: 37.5, y: 0}
    */

    if (faceStart !== 999) {
      this.draw = draw
      .stop(true, true)
    .line(this.cornerList[faceStart].x, this.cornerList[faceStart].y, this.cornerList[faceEnd].x, this.cornerList[faceEnd].y)
    .stroke({ color: '#f06', width: 1})
    }
  },

  currentUnit: undefined
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

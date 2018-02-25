
const draw = SVG('container')

const Hex = Honeycomb.extendHex({
  size: hexSize,
  orientation: 'flat',

  render (draw) {
    const { x, y } = this.toPoint()
    const corners = this.corners()
    this.screenCoords = {'x': x, 'y': y}
    this.cornerList = this.corners().map(corner => this.toPoint().add(corner))
    this.currentUnit = undefined
    this.selected = false

    this.draw = draw
    	.polygon(corners.map(({ x, y }) => `${x},${y}`))
      .fill('none')
      .stroke({ width: 1, color: '#E0E0E0' })
      .translate(x, y)
  },

  highlight () {
    
    if (this.selected === true) {
      this.selected = true
      this.draw
      .fill({ opacity: 1, color: 'aquamarine' })      
    } else {
      this.selected = false
      this.draw
      .fill({ opacity: 0, color: 'none' })      
    }
  },

  facing (face, uniqueDesignation) {
    
    let faceStart, faceEnd, x1, x2, y1, y2, lines

    switch (face) {
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
      faceStart = 4
      faceEnd = 5
    }   
    // 1-2 bottom
    // 2-3 bottom left
    // 3-4 top left
    // 4-5 top
    // 5-0 top right
    // 0-1 bottom right
    x1 = this.cornerList[faceStart].x
    y1 = this.cornerList[faceStart].y
    x2 = this.cornerList[faceEnd].x
    y2 = this.cornerList[faceEnd].y
 
    lines = _.toString([x1, y1, x2, y2, (x1 + x2) / 2, (y1 + y2) / 2, this.cornerList[3].x + hexSize, this.cornerList[3].y])

    draw
    .polyline(lines)
    .stroke({ color: '#f06', width: 1})
    .fill('none')
    .attr('id', uniqueDesignation + '-facing')
  },

  currentUnit: undefined
})

const Grid = Honeycomb.defineGrid(Hex)

const grid = Grid.rectangle({
  width: 100,
  height: 100,
  // render each hex, passing the draw instance
  onCreate (hex) {
    hex.render(draw)
  }
})

function getHexFromCoords (pageX, pageY) {
  let hexCoordinates = Grid.pointToHex([pageX, pageY])
  let hex = grid.get(hexCoordinates)

  return hex
}

function toggleHexSelection (hex) {
  _.forEach(units, (name) => {
    let h = getUnitHex(name)
    h.selected = false
    h.highlight()            
  })
  hex.selected = true
  hex.highlight()
}

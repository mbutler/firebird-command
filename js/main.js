$.getJSON('../js/dingo.json', (dingo) => {
  const hex = grid.get(Hex(dingo.startingHex))
  dingo.symbol.options.size = hexSize * 0.8
  createUnit(hex, dingo.symbol.sidc, dingo.symbol.options)
})

$(document).mousedown((e) => {
  if (e.which === 1) {
    const hexCoordinates = Grid.pointToHex([e.offsetX, e.offsetY])
    const hex = grid.get(hexCoordinates)

    if (hex) {
      createUnit(hex, 'SHGPUCIL---C---',
        { size: hexSize * 0.8,
          uniqueDesignation: 'dingo',
          infoFields: false
        })

      hex.highlight()
    }
  }
})

$(document).on('contextmenu', function (e) {
  const hexCoordinates = Grid.pointToHex([e.offsetX, e.offsetY])
  const hex = grid.get(hexCoordinates)
  const unit = hex.currentUnit
  console.log(unit.id)
  return false
})

$(document).keypress((e) => {
  if (e.which === 32) {
    // tests
    const hex = grid.get(Hex(14, 14))
    animateUnitToHex(hex, 'dingo')
    removeUnitById('panther')
  }
})

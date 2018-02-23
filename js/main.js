$(document).mousedown( (e) => {
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

$(document).on("contextmenu", function(e){
  const hexCoordinates = Grid.pointToHex([e.offsetX, e.offsetY])
  const hex = grid.get(hexCoordinates)
  const unit = hex.currentUnit
  console.log(unit.id)
  return false
})

$(document).keypress( (e) => {
  if (e.which === 32) {
    // tests
    const hex = grid.get(Hex(14, 14))
    animateUnitToHex(hex, 'dingo')
    removeUnitById('panther')
  }
})

const hex = grid.get(Hex(0, 1))

createUnit(hex, 'SHG-UCFM-------',
        { size: hexSize * 0.8,
          uniqueDesignation: 'panther',
          additionalInformation: 'Barnes',
          infoFields: true
        })

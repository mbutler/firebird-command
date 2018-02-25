//create starting units
_.forEach(unitList, (unit) => {
  const hex = grid.get(Hex(unit.startingHex))
  unit.symbol.options.size = hexSize * 0.8
  createUnit(hex, unit.symbol.sidc, unit.symbol.options)
  hex.facing(unit.facing, unit.name)
})

console.log(units)

$(document).mousedown((e) => {
  // check to make sure it's a left button
  if (e.which === 1) {
    let hex = getHexFromCoords(e.pageX, e.pageY)
    if (hex.currentUnit !== undefined) {
      selectedUnit = hex.currentUnit
      toggleHexSelection(hex)      
    }   
  }
})

$(document).keypress((e) => {
  if (e.which === 32) {
    // tests
    const hex = grid.get(Hex(4, 4))    
    changeFacing(3, 'dingo')     
    animateUnitToHex(hex, 'panther')
  }
})

$.contextMenu({
  selector: '.unit',
  build: function ($trigger, e) {
    console.log(e.currentTarget.id)
      // this callback is executed every time the menu is to be shown
      // its results are destroyed every time the menu is hidden
      // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
    return {
      callback: function (key, options) {
        var m = 'clicked: ' + key
        console.log(m)
      },
      // items object here
      items: {
        'change-facing-moving': {'name': '(0) Change facing 1 hexside while moving, per hex',
          'items': {
            'face-1-left-moving': {'name': '(0) Turn 1 hexside left'},
            'face-1-right-moving': {'name': '(0) Turn 1 hexside right'}
          }
        },
        'change-facing-immobile': {'name': '(1) Change facing by 1 or 2 hexsides while immobile',
          'items': {
            'face-1-left-immobile': {'name': '(0) Turn 1 hexside left'},
            'face-2-left-immobile': {'name': '(0) Turn 2 hexsides left'},
            'face-1-right-immobile': {'name': '(0) Turn 1 hexside right'},
            'face-2-right-immobile': {'name': '(0) Turn 2 hexsides right'}
          }
        },
        'assume-firing-stance': {'name': '(2) Assume a firing stance'},
        'look-over-cover': {'name': '(1) Look over/around cover'},
        'throw-grenade': {'name': '(2) Throw a grenade'},
        'open-door': {'name': '(3) Open a door'},
        'open-window': {'name': '(6) Open a window (two hands)'},
        'reload-weapon': {'name': '(8) Reload a weapon'},
        'load-magazine': {'name': '(4) Load a magazine, per round'},
        'drop-weapon': {'name': '(4) Pick up or set down a weapon'},
        'deploy-bipod': {'name': '(8) Deploy bipod for weapon'},
        'climb-window': {'name': '(6) Climb through a window'},
        'draw-pistol-shoulder': {'name': '(3) Draw a pistol - shoulder holster'},
        'draw-pistol-hip': {'name': '(2) Draw a pistol - hip holster'},
        'draw-hand-weapon': {'name': '(2) Draw a hand-to-hand weapon'},
        'access-backpack': {'name': '(7) Get out of military backpack'},
        'sep1': '---------',
        'running-stance': {
          'name': 'Running Stance',
          'items': {
            'running-forward': {'name': '(1) Move forward one hex'},
            'running-backward': {'name': '(2) Move backwards one hex'}
          }
        },
        'low-crouch': {
          'name': 'Low Crouch',
          'items': {
            'crouching-forward': {'name': '(2) Move forward one hex'},
            'crouching-backward': {'name': '(4) Move backwards one hex'}
          }
        },
        'hands-and-knees': {
          'name': 'Hands and Knees',
          'items': {
            'crawling-forward': {'name': '(3) Move forward one hex'},
            'crawling-backward': {'name': '(5) Move backwards one hex'}
          }
        }
      }
    }
  }
})



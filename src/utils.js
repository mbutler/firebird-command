let Database = require('./database')

function incrementTimer () {
  Database.time.once('value').then((snapshot) => {
    let time = snapshot.val()
    let phase = time.phase
    let impulse = time.impulse
    let next = {}

    if (impulse === 4) {
      phase += 1
      impulse = 1
    } else {
      impulse += 1
    }

    next.impulse = impulse
    next.phase = phase

    Database.time.update(next)
    console.log(next)
  })
}

function calculateActionTime (actions, uniqueDesignation) {
  Database.singleUnit(uniqueDesignation).once('value').then((data) => {
    let unit = data.val()
    let ca = unit.combatActionsPerImpulse
    ca.shift() // there's an undefined value in index 0 for some reason
    Database.time.once('value').then((snapshot) => {
      let time = snapshot.val()
      let next = time
      let phase = time.phase
      let impulse = time.impulse
      let i = 0
      
      //while there are still total actions at each impulse
      while (actions >= ca[i]) {
        //subtract the impulse's actions from total actions
        actions = actions - ca[i]
        i++

        //there are only 4 impulses per phase, so loop around
        if (i === 4) {
          i = 0
        }

        //only increment the time if there are actions left
        if (actions > 0) {
          if (impulse === 4) {
            phase += 1
            impulse = 1
          } else {
            impulse += 1
          }

          next.impulse = impulse
          next.phase = phase
        }
      }
      //need to update here
      console.log(next)
      console.log('remaining actions at run time: ', actions)
    })
  })
}

module.exports = {
  incrementTimer: incrementTimer,
  calculateActionTime: calculateActionTime
}

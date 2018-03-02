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
    Database.time.once('value').then((snapshot) => {
      let time = snapshot.val()
      
      for (let i = 0; i <= actions; i++) {

      }
    })
    

    
    console.log(ca['1'])
  })
}

module.exports = {
  incrementTimer: incrementTimer,
  calculateActionTime: calculateActionTime
}

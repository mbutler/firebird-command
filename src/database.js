let firebase = require('firebase')
let config = require('./config')

firebase.initializeApp(config.firebase)
let allUnits = firebase.database().ref('/Games/' + config.gameID + '/Units')
let time = firebase.database().ref('/Games/' + config.gameID + '/time')

function singleUnit (uniqueDesignation) {
  let path = '/Games/' + config.gameID + '/Units/' + uniqueDesignation
  return firebase.database().ref(path)
}

module.exports = {
  allUnits: allUnits,
  firebaseRoot: firebase,
  singleUnit: singleUnit,
  time: time
}

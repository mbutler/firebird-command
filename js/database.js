let firebase = require('firebase')
let config = require('./config')

firebase.initializeApp(config.firebase)
let unitsDB = firebase.database().ref('/Games/' + config.gameID + '/Units')
let firebaseRef = firebase.database().ref

module.exports = {
  unitsDB: unitsDB,
  firebaseRef: firebaseRef,
  firebaseRoot: firebase
}

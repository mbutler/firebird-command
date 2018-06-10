/**
 * Configuration file for setting up the map, document, and database connection
 * @module Config
 * @namespace
 */

function uniqueKey() {
  return '_' + Math.random().toString(36).substr(2, 9)
}

let user = uniqueKey()

let config = {
  mapWidth: 100,
  mapHeight: 100,
  hexSize: 25,
  divContainer: 'stage',
  gameID: '-L6D8cz625nLzyargSEO',
  newGame: false,
  userID: user,
  firebase: {
    apiKey: 'AIzaSyBKxAP8VRE18XIqhkZlI6z3xbCgaPCwVc0',
    authDomain: 'firebird-f30dc.firebaseapp.com',
    databaseURL: 'https://firebird-f30dc.firebaseio.com',
    projectId: 'firebird-f30dc',
    storageBucket: 'firebird-f30dc.appspot.com',
    messagingSenderId: '274623842874'
  }
}

module.exports = config

/*
Data is stored in a Firebase instance. All changes to unit data should happen via the updateUnit
function. Changes to the units are listened for and appropriate funtions to change the view are invoked.
*/

/* let appPath = "https://flickering-fire-8187.firebaseio.com/";
let appName = "Firebird"
let Firebird = new Firebase(appPath + appName)
let gameID = '-L6D8cz625nLzyargSEO' // set from some selection in UI
let gameDB = new Firebase(appPath + appName + '/Games/' + gameID)
let gridDB = new Firebase(appPath + appName + '/Games/' + gameID + '/Grid')
let unitsDB = new Firebase(appPath + appName + '/Games/' + gameID + '/Units') */

let gameID = '-L6D8cz625nLzyargSEO' // set from some selection in UI

firebase.initializeApp(config)

let unitsDB = firebase.database().ref('/Games/' + gameID + '/Units')

let newGame = false // simulating coming from a setup screen or not

const width = window.innerWidth
const height = window.innerHeight
let hexSize = 25
let hexDiagonal = hexSize * 2
let hexesHorizontal = width / (hexSize * 1.5)
let hexesVertical = height / (hexSize * 1.5)
let units = []
let selectedUnit
let area = document.querySelector('#stage')

panzoom(area, { smoothScroll: false })

let unitList = [
    {
    "name": "dingo",
    "skillLevel": 1,
    "strength": 0,
    "intelligence": 0,
    "will": 0,
    "health": 0,
    "agility": 0,
    "baseSpeed": 0,
    "maximumSpeed": 0,
    "skillAccuracyLevel": 0,
    "intSkillFactor": 0,
    "combatActions": 0,
    "combatActionsPerImpulse": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
    },
    "knockoutValue": 0,
    "weapons": [],
    "bodyArmor": {
      "helm": {
        "protectionFactor": 0,
        "weight": 0
      },
      "visor": {
        "protectionFactor": 0,
        "weight": 0
      },
      "body": {
        "protectionFactor": 0,
        "weight": 0
      },
      "limbs": {
        "protectionFactor": 0,
        "weight": 0
      }
    },
    "equipment": [],
    "encumbrance": 0,
    "symbol": {
      "sidc": "SHG-UCFM-------",
      "options": { 
        "size": 0,
        "uniqueDesignation": "dingo",
        "additionalInformation": "",
        "infoFields": false
      }
    },
    "currentMovementType": "",
    "currentHex": [12, 9],
    "facing": 4
  },
  {
    "name": "panther",
    "skillLevel": 0,
    "strength": 0,
    "intelligence": 0,
    "will": 0,
    "health": 0,
    "agility": 0,
    "baseSpeed": 0,
    "maximumSpeed": 0,
    "skillAccuracyLevel": 0,
    "intSkillFactor": 0,
    "combatActions": 0,
    "combatActionsPerImpulse": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
    },
    "knockoutValue": 0,
    "weapons": [],
    "bodyArmor": {
      "helm": {
        "protectionFactor": 0,
        "weight": 0
      },
      "visor": {
        "protectionFactor": 0,
        "weight": 0
      },
      "body": {
        "protectionFactor": 0,
        "weight": 0
      },
      "limbs": {
        "protectionFactor": 0,
        "weight": 0
      }
    },
    "equipment": [],
    "encumbrance": 0,
    "symbol": {
      "sidc": "SHG-UCFM-------",
      "options": { 
        "size": 0,
        "uniqueDesignation": "panther",
        "additionalInformation": "",
        "infoFields": false
      }
    },
    "currentMovementType": "",
    "currentHex": [7, 7],
    "facing": 5
  },
  {
    "name": "snake",
    "skillLevel": 0,
    "strength": 0,
    "intelligence": 0,
    "will": 0,
    "health": 0,
    "agility": 0,
    "baseSpeed": 0,
    "maximumSpeed": 0,
    "skillAccuracyLevel": 0,
    "intSkillFactor": 0,
    "combatActions": 0,
    "combatActionsPerImpulse": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
    },
    "knockoutValue": 0,
    "weapons": [],
    "bodyArmor": {
      "helm": {
        "protectionFactor": 0,
        "weight": 0
      },
      "visor": {
        "protectionFactor": 0,
        "weight": 0
      },
      "body": {
        "protectionFactor": 0,
        "weight": 0
      },
      "limbs": {
        "protectionFactor": 0,
        "weight": 0
      }
    },
    "equipment": [],
    "encumbrance": 0,
    "symbol": {
      "sidc": "SHG-UCFM-------",
      "options": { 
        "size": 0,
        "uniqueDesignation": "snake",
        "additionalInformation": "",
        "infoFields": false
      }
    },
    "currentMovementType": "",
    "currentHex": [15, 15],
    "facing": 2
  }
]

if (newGame === true) {
    _.forEach(unitList, (unit) => {
        let unitObj = {}
        let name = unit.symbol.options.uniqueDesignation
        unitObj[name] = unit
        unitsDB.update(unitObj)
    })    
}

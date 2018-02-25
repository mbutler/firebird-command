$( document ).ready(function() {
    const draw = SVG('container')
    var area = document.querySelector('#container')
    panzoom(area, {
        smoothScroll: false
    })
})

const width = window.innerWidth
const height = window.innerHeight
let hexSize = 25
let hexDiagonal = hexSize * 2
let hexesHorizontal = width / (hexSize * 1.5)
let hexesVertical = height / (hexSize * 1.5)
let units = []
let selectedUnit



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
    "startingHex": [12, 9],
    "currentMovementType": "",
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
    "startingHex": [7, 7],
    "currentMovementType": "",
    "facing": 0
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
    "startingHex": [15, 5],
    "currentMovementType": "",
    "facing": 2
  }
]
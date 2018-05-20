let _ = require('lodash')

let oddsOfHittingTable = [
    [-28, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-27, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-26, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-25, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-24, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-23, 4, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-22, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-21, 6, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [-20, 7, 4, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [-19, 9, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [-18, 12, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [-17, 15, 8, 5, 2, 1, 0, 0, 0, 0, 0, 0, 0],
    [-16, 18, 9, 6, 3, 2, 1, 0, 0, 0, 0, 0, 0],
    [-15, 23, 12, 7, 4, 3, 1, 0, 0, 0, 0, 0, 0],
    [-14, 27, 15, 9, 5, 4, 2, 0, 0, 0, 0, 0, 0],
    [-13, 33, 19, 12, 6, 5, 2, 1, 0, 0, 0, 0, 0],
    [-12, 39, 22, 15, 7, 6, 3, 1, 0, 0, 0, 0, 0],
    [-11, 46, 27, 18, 9, 7, 4, 1, 0, 0, 0, 0, 0],
    [-10, 53, 33, 22, 12, 9, 5, 1, 0, 0, 0, 0, 0],
    [-9, 60, 39, 27, 15, 12, 6, 2, 0, 0, 0, 0, 0],
    [-8, 67, 46, 33, 18, 15, 7, 2, 1, 0, 0, 0, 0],
    [-7, 74, 53, 39, 22, 18, 9, 3, 1, 0, 0, 0, 0],
    [-6, 80, 60, 46, 27, 22, 12, 4, 1, 0, 0, 0, 0],
    [-5, 86, 67, 53, 33, 27, 15, 5, 2, 0, 0, 0, 0],
    [-4, 90, 74, 60, 39, 33, 18, 6, 2, 0, 0, 0, 0],
    [-3, 94, 80, 67, 46, 39, 22, 7, 3, 1, 0, 0, 0],
    [-2, 96, 86, 74, 53, 46, 27, 9, 4, 1, 0, 0, 0],
    [-1, 98, 90, 80, 60, 53, 33, 12, 5, 1, 1, 0, 0],
    [0, 100, 94, 86, 67, 60, 39, 15, 6, 2, 1, 0, 0],
    [1, 100, 96, 90, 74, 67, 46, 18, 7, 2, 10, 0, 0],
    [2, 100, 98, 94, 80, 74, 53, 22, 9, 3, 2, 0, 0],
    [3, 100, 100, 96, 86, 80, 60, 27, 12, 4, 2, 0, 0],
    [4, 100, 100, 98, 90, 86, 67, 33, 15, 5, 3, 1, 0],
    [5, 100, 100, 100, 94, 90, 74, 39, 18, 6, 4, 1, 0],
    [6, 100, 100, 100, 96, 94, 80, 46, 22, 7, 5, 1, 0],
    [7, 100, 100, 100, 98, 96, 86, 53, 27, 9, 6, 2, 1],
    [8, 100, 100, 100, 100, 98, 90, 60, 33, 12, 7, 2, 1],
    [9, 100, 100, 100, 100, 100, 94, 67, 39, 15, 9, 3, 1],
    [10, 100, 100, 100, 100, 100, 96, 74, 46, 18, 12, 4, 2],
    [11, 100, 100, 100, 100, 100, 98, 80, 53, 22, 15, 5, 2],
    [12, 100, 100, 100, 100, 100, 100, 86, 60, 27, 18, 6, 3],
    [13, 100, 100, 100, 100, 100, 100, 90, 67, 33, 22, 7, 4],
    [14, 100, 100, 100, 100, 100, 100, 94, 74, 39, 27, 9, 5],
    [15, 100, 100, 100, 100, 100, 100, 96, 80, 46, 33, 12, 6],
    [16, 100, 100, 100, 100, 100, 100, 98, 86, 53, 39, 15, 7],
    [17, 100, 100, 100, 100, 100, 100, 100, 90, 60, 46, 18, 9],
    [18, 100, 100, 100, 100, 100, 100, 100, 94, 67, 53, 22, 12],
    [19, 100, 100, 100, 100, 100, 100, 100, 96, 74, 60, 27, 15],
    [20, 100, 100, 100, 100, 100, 100, 100, 98, 80, 67, 33, 18],
    [21, 100, 100, 100, 100, 100, 100, 100, 100, 86, 74, 39, 22],
    [22, 100, 100, 100, 100, 100, 100, 100, 100, 90, 80, 46, 27],
    [23, 100, 100, 100, 100, 100, 100, 100, 100, 94, 86, 53, 33],
    [24, 100, 100, 100, 100, 100, 100, 100, 100, 96, 90, 60, 39],
    [25, 100, 100, 100, 100, 100, 100, 100, 100, 98, 94, 67, 46],
    [26, 100, 100, 100, 100, 100, 100, 100, 100, 100, 96, 74, 53],
    [27, 100, 100, 100, 100, 100, 100, 100, 100, 100, 98, 80, 60],
    [28, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 86, 67],
    [29, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 90, 74],
    [30, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 94, 80],
    [31, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 96, 86],
    [32, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 98, 90],
    [33, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 94],
    [34, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 96]
]

function oddsOfHitting(accuracy, range) {
    let odds = 0
    let rangeIndex = getIndexOfRange(range)

    if (accuracy < -28) {
        odds = 0
    }

    if (accuracy > 34) {
        odds = 100
    }

    _.forEach(oddsOfHittingTable, (val) => {
        if (accuracy === val[0]) {
            odds = val[rangeIndex]
        }
    })

    return odds
}

function getIndexOfRange(distance) {
    let index

    if (_.inRange(distance, 250, 999)) index = 12
    if (_.inRange(distance, 150, 250)) index = 11
    if (_.inRange(distance, 85, 150)) index = 10
    if (_.inRange(distance, 55, 85)) index = 9
    if (_.inRange(distance, 30, 55)) index = 8
    if (_.inRange(distance, 15, 30)) index = 7
    if (_.inRange(distance, 8, 15)) index = 6
    if (distance === 7) index = 5
    if (distance === 6) index = 4
    if (distance === 5) index = 4
    if (distance === 4) index = 3
    if (distance === 3) index = 2
    if (distance === 2) index = 1
    if (distance === 1) index = 1

    return index
    
}

module.exports = {
    oddsOfHitting: oddsOfHitting
}
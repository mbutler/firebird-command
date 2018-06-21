/**
 * This module handles creating the hex grid and individual hex methods
 * @module Map
 * @namespace
 */

let SVG = require('svg.js')
let Honeycomb = require('honeycomb-grid')
let _ = require('lodash')
let config = require('./config')

const draw = SVG(config.divContainer)

const Hex = Honeycomb.extendHex({
    size: config.hexSize,
    orientation: 'flat',

    render(draw) {
        const { x, y } = this.toPoint()
        const corners = this.corners()
        this.screenCoords = { 'x': x, 'y': y }
        this.cornerList = this.corners().map(corner => this.toPoint().add(corner))
        this.currentUnit = undefined
        this.selected = false

        this.draw = draw
            .polygon(corners.map(({ x, y }) => `${x},${y}`))
            .fill('none')
            .stroke({ width: 1, color: '#E0E0E0' })
            .translate(x, y)
    },

    highlight() {
        if (this.selected === true) {
            this.selected = true
            this.draw
                .fill({ opacity: 1, color: 'aquamarine' })
                
        } else {
            this.selected = false
            this.draw
                .fill({ opacity: 0, color: 'none' })
        }
    },

    facing(face, uniqueDesignation) {
        let faceStart, faceEnd, x1, x2, y1, y2, lines

        switch (face) {
            case 0:
                // top
                faceStart = 4
                faceEnd = 5
                break
            case 1:
                // top right
                faceStart = 5
                faceEnd = 0
                break
            case 2:
                // bottom right
                faceStart = 0
                faceEnd = 1
                break
            case 3:
                // bottom
                faceStart = 1
                faceEnd = 2
                break
            case 4:
                // bottom left
                faceStart = 2
                faceEnd = 3
                break
            case 5:
                // top left
                faceStart = 3
                faceEnd = 4
                break
            default:
                faceStart = 4
                faceEnd = 5
        }
        // 1-2 bottom
        // 2-3 bottom left
        // 3-4 top left
        // 4-5 top
        // 5-0 top right
        // 0-1 bottom right
        x1 = this.cornerList[faceStart].x
        y1 = this.cornerList[faceStart].y
        x2 = this.cornerList[faceEnd].x
        y2 = this.cornerList[faceEnd].y

        lines = _.toString([x1, y1, x2, y2, (x1 + x2) / 2, (y1 + y2) / 2, this.cornerList[3].x + config.hexSize, this.cornerList[3].y])

        draw
            .polyline(lines)
            .stroke({ color: '#f06', width: 1 })
            .fill('none')
            .attr('id', uniqueDesignation + '-facing')
    }
})

const Grid = Honeycomb.defineGrid(Hex)

const grid = Grid.rectangle({
    width: config.mapWidth,
    height: config.mapHeight,
    // render each hex, passing the draw instance
    onCreate(hex) {
        hex.render(draw)
    }
})

/**
 * Finds a hex given a coordinate
 *
 * @param {object} pageX - A pointer screen coordinates for X
 * @param {object} pageY - A pointer screen coordinates for Y
 * @memberof Map
 * @return {hex} - A Honeycomb hex object
 */
function getHexFromCoords(pageX, pageY) {
    let hexCoordinates = Grid.pointToHex([pageX, pageY])
    let hex = grid.get(hexCoordinates)

    return hex
}

/**
 * Gets a hex object if given an point
 *
 * @param {array} point- An array (or object) of coordinates
 * @memberof Map
 * @return {object} - A hex
 */
function getHexFromPoint(point) {
    let hex = grid.get(Hex(point))
    return hex
}

/**
 * Gets a list of all all hexes in a radius from a coordinate
 *
 * @param {array} coords - A point occupied by the target
 * @param {number} range - A number of hexes as radius from coordinates
 * @memberof Map
 * @return {array} - An array of hex objects
 */
function coordsRange(coords, range) {
    let hex = getHexFromPoint(coords)
    let results = []
    for (let i = (hex.q - range); i <= (hex.q + range); i++) {
        for (let j = (hex.s - range); j <= (hex.s + range); j++) {
            for (let k = (hex.r - range); k <= (hex.r + range); k++) {
                if (i + j + k === 0) {
                    let newHex = getHexFromPoint({q: i, r: k, s: j})
                    if (newHex !== undefined) {
                        results.push(newHex)
                    }                    
                }
            }
        }
    }

    return results
}

module.exports = {
    Hex: Hex,
    Grid: Grid,
    grid: grid,
    getHexFromCoords: getHexFromCoords,
    getHexFromPoint: getHexFromPoint,
    coordsRange: coordsRange
}
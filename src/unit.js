/**
 * This module handles creating, controlling, and updating units
 * @module Unit
 * @namespace Unit
 */

let Database = require('./database')
let ms = require('milsymbol')
let config = require('./config')
let _ = require('lodash')
let unitList = require('./unit-list')
let Map = require('./map')
let Utils = require('./utils')

/**
 * Creates the graphical elements of a unit, adds to DOM, and adds events
 *
 * @param {object} hex - A Honeycomb hex object
 * @param {string} sidc - A milsymbol code for the type of svg symbol to create. e.g. 'SHG-UCFM-------'
 * @param {object} options - Milsymbol options to pass into the its constructor. e.g. {'size': 0,'uniqueDesignation': 'dingo','additionalInformation': '','infoFields': false}
 * @requires Utils
 * @memberof Unit
 * @return {undefined} - Modifies DOM directly
 */
function create(hex, sidc, options) {
    let container, symbol, size

    // create div container and svg symbol and set position
    symbol = new ms.Symbol(sidc, options)
    size = symbol.getSize()
    container = createSymbolContainer(options.uniqueDesignation)
    $(container).data('size', size)
    container.innerHTML = symbol.asSVG()
    container = positionUnit(hex, container)

    // store the symbol in the hex
    hex.currentUnit = container

    // add the unit to the DOM and units list
    $('#' + config.divContainer).append(container)

    // store the coordinates of the hex in the unit
    setUnitCoords(hex, options.uniqueDesignation)

    $(container).on('touchstart mousedown', (e) => {
        Utils.populateControlPanel(options.uniqueDesignation)
        Utils.createButtonSet(options.uniqueDesignation)
        controlPanel.open()
        let hex = getUnitHex(e.currentTarget.id)
        if (hex.currentUnit !== undefined) {
            toggleHexSelection(hex)
        }
    })
}

/**
 * Destroys a unit. Out of date as it uses the old unitList and does not interact with the database
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @memberof Unit
 * @return {undefined} - Modifies DOM directly
 */
function removeUnitById(uniqueDesignation) {
    let unit = document.getElementById(uniqueDesignation)
        // clear the hex
    let hex = getUnitHex(uniqueDesignation)
    hex.currentUnit = undefined
    unit.parentNode.removeChild(unit)
    $('#' + uniqueDesignation + '-facing').remove()
    _.pull(unitList.unitsToggleList, uniqueDesignation)
}

/**
 * Find the point coordinates for a given unit stored in its data attribute.
 *
 * @todo Read from database instead
 * @param {string} uniqueDesignation - The name of the unit
 * @memberof Unit
 * @return {object} - A Honeycomb hex coordinates object. e.g. { x: 0, y: 0 }
 */
function getUnitCoords(uniqueDesignation) {
    let unit = document.getElementById(uniqueDesignation)
    let point = $.data(unit, 'coords')

    return point
}

/**
 * Find the hex for a given unit
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Map
 * @memberof Unit
 * @return {object} - A Honeycomb hex object
 */
function getUnitHex(uniqueDesignation) {
    let coords = getUnitCoords(uniqueDesignation)
    let hex = Map.grid.get(Map.Hex(coords))

    return hex
}

/**
 * Sets the coordinates for a unit
 *
 * @todo Write to database instead
 * @param {object} hex - A Honeycomb hex object
 * @param {string} uniqueDesignation - The name of the unit
 * @memberof Unit
 * @return {object} - A Honeycomb hex coordinates object. e.g. { x: 0, y: 0 }
 */
function setUnitCoords(hex, uniqueDesignation) {
    let unit = document.getElementById(uniqueDesignation)
    $(unit).data('coords', hex.coordinates())
}

/**
 * Creates a DOM element to hold graphics and data
 *
 * @param {string} uniqueDesignation - The name of the unit
 * @memberof Unit
 * @return {object} - A div element with id set to unique designation and class to unit
 */
function createSymbolContainer(uniqueDesignation) {
    let div = document.createElement('div')
    div.setAttribute('id', uniqueDesignation)
    div.setAttribute('class', 'unit')

    return div
}

/**
 * Positions the unit according to the irregular size of individual milsymbols
 *
 * @param {object} hex - A Honeycomb hex object
 * @param {object} unit - The div container for the unit
 * @memberof Unit
 * @return {object} - A modified div container DOM element
 */
function positionUnit(hex, unit) {
    let hexDiagonal = config.hexSize * 2
    let symbolSize = $.data(unit, 'size')
    let offsetX = (hexDiagonal - symbolSize.width) / 2
    let offsetY = (hexDiagonal - symbolSize.height) / 4

    // need to center it based on symbol's irregular size
    unit.style.position = 'absolute'
    unit.style.left = (hex.screenCoords.x + offsetX) + 'px'
    unit.style.top = (hex.screenCoords.y + offsetY) + 'px'

    return unit
}

/**
 * Moves a unit to a new hex
 *
 * @param {object} point - A Honeycomb point object. e.g. {x:0, y:1}
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @requires Map
 * @memberof Unit
 * @return {undefined} - Modifies the DOM directly
 */
function animateUnitToHex(point, uniqueDesignation) {
    // need to query Firebase for the hex that was updated then perform
    // animation and view updates in the callback
    //
    Database.singleUnit(uniqueDesignation).once('value').then((data) => {
        let facing
        let val = data.val()
        facing = val.facing

        const hex = Map.grid.get(point)

        let unit = document.getElementById(uniqueDesignation)

        let symbolSize = $.data(unit, 'size')
        let offsetX = ((config.hexSize * 2) - symbolSize.width) / 2
        let offsetY = ((config.hexSize * 2) - symbolSize.height) / 4

        // clear the previous hex
        let previousHex = getUnitHex(uniqueDesignation)
        previousHex.currentUnit = undefined
        $('#' + uniqueDesignation + '-facing').remove()
        previousHex.selected = false
        previousHex.highlight()

        $('#' + uniqueDesignation).animate({
            'top': (hex.screenCoords.y + offsetY) + 'px',
            'left': (hex.screenCoords.x + offsetX) + 'px'
        }, {
            duration: 500,
            complete: function() {
                $('#' + uniqueDesignation + '-facing').remove()
                setUnitCoords(hex, uniqueDesignation)
                hex.currentUnit = unit
                hex.facing(facing, uniqueDesignation)
            }
        })
    })
}

/**
 * Changes a unit's facing
 *
 * @param {number} face - A number 0-5 representing the face of the hexagon as documented in Honeycomb
 * @param {string} uniqueDesignation - The name of the unit
 * @memberof Unit
 * @return {undefined} - Modifies the DOM directly
 */
function changeFacing(face, uniqueDesignation) {
    let hex = getUnitHex(uniqueDesignation)
    $('#' + uniqueDesignation + '-facing').remove()
    hex.facing(face, uniqueDesignation)
}

/**
 * Updates the unit in the database for an arbitrary number of properties
 *
 * @param {object} updates - A JSON snippet of all properties to change. e.g. {facing: 1, currentHex: [6, 9]}
 * @param {string} uniqueDesignation - The name of the unit
 * @requires Database
 * @memberof Unit
 * @return {undefined} - Modifies the database directly
 */
function update(updates, uniqueDesignation) {
    let changedValue = {}
    let keys = _.keys(updates)

    for (var i = 0; i <= keys.length - 1; i++) {
        changedValue['/' + uniqueDesignation + '/' + keys[i]] = updates[keys[i]]        
    }

    Database.allUnits.update(changedValue)
}

/**
 * Toggles the highlighting of a selected hex on/off
 *
 * @param {object} hex - A Honeycomb hex object
 * @memberof Unit
 * @return {undefined} - Modifies the DOM directly
 */
function toggleHexSelection(hex) {
    _.forEach(unitList.unitsToggleList, (name) => {
        let h = getUnitHex(name)
        h.selected = false
        h.highlight()
    })
    hex.selected = true
    hex.highlight()
}

module.exports = {
    create: create,
    removeUnitById: removeUnitById,
    getUnitCoords: getUnitCoords,
    getUnitHex: getUnitHex,
    setUnitCoords: setUnitCoords,
    animateUnitToHex: animateUnitToHex,
    changeFacing: changeFacing,
    update: update
}
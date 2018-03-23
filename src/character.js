/**
 * This module handles character creation
 * @module Character
 * @namespace
 */

let Database = require('./database')

function formSubmit () {
    let submission = document.getElementById("character-creation-form").submit()
    console.log(submission)
}

window.formSubmit = formSubmit

module.exports = {
    formSubmit: formSubmit
}
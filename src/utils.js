let Database = require('./database')

function createButtonSet(uniqueDesignation) {
    let face1LeftMoving = `<li role="presentation"><a role="menuitem" tabindex="-1" onclick="action('face-1-left-moving', '${uniqueDesignation}')">Turn 1 hexside left <span class="badge">0</span></a></li>`

    $('#facing-dropdown').append(face1LeftMoving)
}

function incrementTimer() {
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

function calculateActionTime(actions, uniqueDesignation) {
    Database.singleUnit(uniqueDesignation).once('value').then((data) => {
        let unit = data.val()
        let ca = unit.combatActionsPerImpulse
        ca.shift() // there's an undefined value in index 0 for some reason
        Database.time.once('value').then((snapshot) => {
            let time = snapshot.val()
            let next = time
            let phase = time.phase
            let impulse = time.impulse
            let i = 0

            //while there are still total actions at each impulse
            while (actions >= ca[i]) {
                //subtract the impulse's actions from total actions
                actions = actions - ca[i]
                i++

                //there are only 4 impulses per phase, so loop around
                if (i === 4) {
                    i = 0
                }

                //only increment the time if there are actions left
                if (actions > 0) {
                    if (impulse === 4) {
                        phase += 1
                        impulse = 1
                    } else {
                        impulse += 1
                    }

                    next.impulse = impulse
                    next.phase = phase
                }
            }
            //need to update here
            console.log(next)
            console.log('remaining actions at run time: ', actions)
        })
    })
}

function populateControlPanel(uniqueDesignation) {
    Database.singleUnit(uniqueDesignation).once('value').then((data) => {
        let unit = data.val()
        $('#panelUniqueDesignation h3').html(uniqueDesignation)
        $('#skill-level').html(unit.skillLevel)
        $('#strength').html(unit.strength)
        $('#intelligence').html(unit.intelligence)
        $('#will').html(unit.will)
        $('#health').html(unit.health)
        $('#agility').html(unit.agility)
        $('#base-speed').html(unit.baseSpeed)
        $('#maximum-speed').html(unit.maximumSpeed)
        $('#gun-combat-skill-level').html(unit.gunCombatSkillLevel)
        $('#skill-accuracy-level').html(unit.skillAccuracyLevel)
        $('#int-skill-factor').html(unit.intSkillFactor)
        $('#combat-actions').html(unit.combatActions)
        $('#impulse1').html(unit.combatActionsPerImpulse['1'])
        $('#impulse2').html(unit.combatActionsPerImpulse['2'])
        $('#impulse3').html(unit.combatActionsPerImpulse['3'])
        $('#impulse4').html(unit.combatActionsPerImpulse['4'])
        $('#knockout-value').html(unit.knockoutValue)
    })
}

module.exports = {
    incrementTimer: incrementTimer,
    calculateActionTime: calculateActionTime,
    populateControlPanel: populateControlPanel,
    createButtonSet: createButtonSet
}
let _ = require('lodash')

let weapons = [
    {
        name: "m16a1",
        aimTime: [-99, -22, -12, -9, -7, -6, -5, -4, -3, -2, -1, 0],
        reloadTime: 8,
        rateOfFire: 7,
        ammoCap: 30,
        ammoWeight: 1
    },
    {
        name: "colt-45",
        aimTime: [-99, -18, -11, -10, -9, -8, -7],
        reloadTime: 4,
        rateOfFire: 1,
        ammoCap: 7,
        ammoWeight: 0.7
    }
]

function getWeapon(weaponName) {
    let weapon 

    _.forEach(weapons, (gun) => {
        if (gun.name === weaponName) {
            weapon = gun
        }
    })

    return weapon
}

module.exports = {
    getWeapon: getWeapon
}
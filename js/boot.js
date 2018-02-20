var FirebirdCommand = FirebirdCommand || {}

FirebirdCommand.Boot = function () {}

FirebirdCommand.Boot.prototype = {
  preload: function () {
        // this.load.image('preloadbar', '/images/loader_bar.png')
  },

  create: function () {
        // loading screen will have a white background
    this.game.stage.backgroundColor = '#808000'

        // scaling options
    this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE

        // have the game centered horizontally
        // this.scale.pageAlignHorizontally = true
        // this.scale.pageAlignVertically = true

        // physics system
    //this.game.physics.startSystem(Phaser.Physics.ARCADE)

    this.state.start('Preload');
  }
}

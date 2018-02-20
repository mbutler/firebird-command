var FirebirdCommand = FirebirdCommand || {}

FirebirdCommand.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'container')
FirebirdCommand.game.state.add('Boot', FirebirdCommand.Boot)
FirebirdCommand.game.state.add('Preload', FirebirdCommand.Preload)
FirebirdCommand.game.state.add('Game', FirebirdCommand.Game)

FirebirdCommand.game.state.start('Boot')

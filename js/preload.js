var FirebirdCommand = FirebirdCommand || {}

FirebirdCommand.Preload = function () {}

FirebirdCommand.Preload.prototype = {

  create: function () {
    this.state.start('Game')
  }

}

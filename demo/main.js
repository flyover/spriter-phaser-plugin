function main() {
  function preload(game) {
    //console.log("preload", arguments);
    game.load.image('logo', 'https://cdn.rawgit.com/photonstorm/phaser/master/v2/phaser-logo-small.png');
    game.load.json('player.scon', 'https://cdn.rawgit.com/flyover/spriter.js/master/demo/GreyGuy/player.scon');
    game.load.text('player.tps.json', 'https://cdn.rawgit.com/flyover/spriter.js/master/demo/GreyGuy/player.tps.json');
    game.load.image('player.tps.png', 'https://cdn.rawgit.com/flyover/spriter.js/master/demo/GreyGuy/player.tps.png');
  }
  function create(game) {
    //console.log("create", arguments);
    var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);
    var player = game.add.spriter({ json: 'player.scon', atlas: 'player.tps.json', image: 'player.tps.png', entity: 'Player', anim: 'walk' });
  }
  function update(game) {
    //console.log("update", arguments);
  }
  function render(game) {
    //console.log("render", arguments);
  }
  var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
}

var socket = io.connect();

var myId=0;
var game;
var tank;
var tanksList = {};

ThePlayer = function (index, game, player) {

  this.cursor = {
    left:false,
    right:false,
    up:false,
    fire:false
  };

  this.input = {
    left:false,
    right:false,
    up:false,
    fire:false
  };

  var x = 0;
  var y = 0;

  this.game = game;
  this.health = 7;
  this.player = player;

  // our bullet group
  this.bullets = game.add.group();
  this.bullets.enableBody = true;
  this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
  this.bullets.createMultiple(20, 'bullet', 0, false);
  this.bullets.setAll('anchor.x', 0.5);
  this.bullets.setAll('anchor.y', 0.5);
  this.bullets.setAll('outOfBoundsKill', true);
  this.bullets.setAll('checkWorldBounds', true);


  this.currentSpeed =0;
  this.fireRate = 750;
  this.nextFire = 0;
  this.alive = true;

  this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
  this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
  this.turret = game.add.sprite(x, y, 'enemy', 'turret');

  this.shadow.anchor.set(0.5);
  this.tank.anchor.set(0.5);
  this.turret.anchor.set(0.3, 0.5);

  this.tank.id = index;
  game.physics.enable(this.tank, Phaser.Physics.ARCADE);
  this.tank.body.immovable = false;
  this.tank.body.collideWorldBounds = true;
  this.tank.body.bounce.setTo(0, 0);

  this.tank.angle = 0;

  game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
};

ThePlayer.prototype.update = function() {

  var inputChanged = (
    this.cursor.left != this.input.left ||
    this.cursor.right != this.input.right ||
    this.cursor.up != this.input.up ||
    this.cursor.fire != this.input.fire
  );


  if (inputChanged)
  {
    //Handle input change here
    //send new values to the server
    if (this.tank.id == myId)
    {
      // send latest valid state to the server
      this.input.x = this.tank.x;
      this.input.y = this.tank.y;
      this.input.angle = this.tank.angle;
      this.input.rot = this.turret.rotation;

      socket.emit('playerDataToServer', this.input);
    }
  }

  if (this.cursor.left)
  {
    this.tank.angle -= 1;
  }
  else if (this.cursor.right)
  {
    this.tank.angle += 1;
  }
  if (this.cursor.up)
  {
    //  The speed we'll travel at
    this.currentSpeed = 300;
  }
  else
  {
    if (this.currentSpeed > 0)
    {
      this.currentSpeed -= 4;
    }
  }
  if (this.cursor.fire)
  {
    this.fire({x:this.cursor.tx, y:this.cursor.ty});
  }

  if (this.currentSpeed > 0)
  {
    game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
  }
  else
  {
    game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
  }

  this.shadow.x = this.tank.x;
  this.shadow.y = this.tank.y;
  this.shadow.rotation = this.tank.rotation;

  this.turret.x = this.tank.x;
  this.turret.y = this.tank.y;
};

ThePlayer.prototype.fire = function(target) {
  if (!this.alive) return;
  if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
  {
    this.nextFire = this.game.time.now + this.fireRate;
    var bullet = this.bullets.getFirstDead();
    bullet.reset(this.turret.x, this.turret.y);

    bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
  }
};

ThePlayer.prototype.kill = function() {
  this.tank.kill();
  this.turret.kill();
  this.shadow.kill();
};

ThePlayer.prototype.damage = function() {

  this.health -= 1;

  if (this.health <= 0)
  {
    this.alive = false;

    this.kill();

    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(tank.x, tank.y);
    explosionAnimation.play('kaboom', 30, false, true);
  }
};
function createGame() {
  game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
}

function preload() {
  console.log('preload');
  game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
  game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
  game.load.image('logo', 'assets/logo.png');
  game.load.image('bullet', 'assets/bullet.png');
  game.load.image('earth', 'assets/scorched_earth.png');
  game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
}

function create() {
  console.log('game create started');
  //  Resize our game world to be a 2000 x 2000 square
  game.world.setBounds(-1000, -1000, 2000, 2000);
  game.stage.disableVisibilityChange = true;

  //  Our tiled scrolling background
  land = game.add.tileSprite(0, 0, 800, 600, 'earth');
  land.fixedToCamera = true;

  player = new ThePlayer(myId, game, tank);
  tanksList[myId] = player;
  tank = player.tank;
  turret = player.turret;
  tank.x=0;
  tank.y=0;
  bullets = player.bullets;
  shadow = player.shadow;

  //  Explosion pool
  explosions = game.add.group();

  for (var i = 0; i < 10; i++)
  {
    var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
    explosionAnimation.anchor.setTo(0.5, 0.5);
    explosionAnimation.animations.add('kaboom');
  }

  tank.bringToTop();
  turret.bringToTop();

  logo = game.add.sprite(0, 200, 'logo');
  logo.fixedToCamera = true;

  game.input.onDown.add(removeLogo, this);

  game.camera.follow(tank);
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
  game.camera.focusOnXY(0, 0);

  cursors = game.input.keyboard.createCursorKeys();

  setTimeout(removeLogo, 1000);
  console.log('game.create finished');
  socket.emit('handshake');
}

function update () {
  player.input.left = cursors.left.isDown;
  player.input.right = cursors.right.isDown;
  player.input.up = cursors.up.isDown;
  player.input.fire = game.input.activePointer.isDown;
  player.input.tx = game.input.x+ game.camera.x;
  player.input.ty = game.input.y+ game.camera.y;

  turret.rotation = game.physics.arcade.angleToPointer(turret);
  land.tilePosition.x = -game.camera.x;
  land.tilePosition.y = -game.camera.y;

  for (var i in tanksList)
  {
    var curBullets = tanksList[i].bullets;
    var curTank = tanksList[i].tank;
    for (var j in tanksList)
    {
      if (j!=i)
      {
        var targetTank = tanksList[j].tank;
        game.physics.arcade.overlap(curBullets, targetTank, bulletHitPlayer, null, this);
      }

      if (tanksList[j].alive)
      {
        tanksList[j].update();
      }
    }
  }
}

function removeLogo () {
  game.input.onDown.remove(removeLogo, this);
  logo.kill();
}

function bulletHitPlayer (tank, bullet) {
  bullet.kill();
  if(tank.id == myId){
    player.damage();
  }
}

socket.on('user joined', function(id) {
  myId = id;
  createGame();
  console.log(myId + ' joined');
});

socket.on('spawn enemy', function(k, x, y){
  console.log('spawn enemy message arrived');
  if(!(k in tanksList)){
    var tnk = new ThePlayer(k, game, tank);
    tanksList[k] = tnk;
    console.log(k + ' added');
    console.log(tanksList);
  }
});

socket.on('updateState', function(id, state) {
  if (tanksList[id])  {
    tanksList[id].cursor = state;
    tanksList[id].tank.x = state.x;
    tanksList[id].tank.y = state.y;
    tanksList[id].tank.angle = state.angle;
    tanksList[id].turret.rotation = state.rot;
    tanksList[id].update();
  }
});

socket.on('deleteDisconnected', function(id){
  tanksList[id].kill();
  delete tanksList[id];
});

function render (){
  game.debug.text('HP: ' + player.health, 710, 32);
}

'use strict';var game = undefined;
var playerImage = undefined;
var playerMusic = undefined;

var CloudPlatform = function CloudPlatformCb(gameObj, x, y, key, group) {
  if (typeof group === 'undefined') {group = game.world;}
  Phaser.Sprite.call(this, game, x, y, key);
  gameObj.physics.arcade.enable(this);
  this.anchor.x = 0.5;
  this.body.customSeparateX = true;
  this.body.customSeparateY = true;
  this.body.allowGravity = false;
  this.body.immovable = true;
  this.playerLocked = false;
  group.add(this);};

CloudPlatform.prototype = Object.create(Phaser.Sprite.prototype);
CloudPlatform.prototype.constructor = CloudPlatform;
CloudPlatform.prototype.addMotionPath = function addMotionPathCb(motionPath) {
  this.tweenX = this.game.add.tween(this.body);
  this.tweenY = this.game.add.tween(this.body);
  //  motionPath is an array containing objects with this structure
  //  [
  //   { x: "+200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeIn" }
  //  ]
  for (var i = 0; i < motionPath.length; i++) {
    this.tweenX.to({ x: motionPath[i].x }, motionPath[i].xSpeed, motionPath[i].xEase);
    this.tweenY.to({ y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);}

  this.tweenX.loop();
  this.tweenY.loop();};

CloudPlatform.prototype.start = function startCb() {
  this.tweenX.start();
  this.tweenY.start();};

CloudPlatform.prototype.stop = function stopCb() {
  this.tweenX.stop();
  this.tweenY.stop();};


var PhaserGame = function PhaserGameCb() {
  this.bg = null;
  this.trees = null;
  this.player = null;
  this.gifts = null;
  this.giftsCount = [/*20, 680, 1170, */1410];
  this.stationary = null;
  this.ground = null;
  this.clouds = null;
  this.facing = 'left';
  this.jumpTimer = 0;
  this.cursors = null;
  this.locked = false;
  this.lockedTo = null;
  this.wasLocked = false;
  this.willJump = false;
  this.score = 0;
  this.music = null;
  this.finishAnimationPlaying = null;
  this.unFinishAnimation = null;
  this.finishAnimation = null;};

PhaserGame.prototype = { 
  init: function init() {
    this.game.renderer.renderSession.roundPixels = true;
    this.world.resize(640 * 3, 480);
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 600;}, 

  preload: function preload() {
    this.load.image('trees', 'assets/images/trees-h.png');
    this.load.image('background', 'assets/images/overlay_background.png');
    this.load.image('platform', 'assets/images/platform.png');
    this.load.image('ground', 'assets/images/ground-copy.png');
    this.load.image('cloud-platform', 'assets/images/cloud-platform.png');
    this.load.image('star', 'assets/images/star.png');
    this.load.image('face', 'assets/images/' + playerImage);
    this.load.image('door', 'assets/images/smart.png');
    this.load.spritesheet('dude', 'assets/images/dude2.png', 32, 48);
    this.load.audio('music', playerMusic);
    game.load.audio('sfx', ['assets/audio/fx_mixdown.mp3', 'assets/audio/fx_mixdown.ogg']);}, 

  create: function create() {var _this = this;
    this.music = game.add.audio('music');
    this.music.play();

    this.fx = game.add.audio('sfx');
    this.fx.allowMultiple = true;
    this.fx.addMarker('alien death', 1, 1.0);
    this.fx.addMarker('boss hit', 3, 0.5);
    this.fx.addMarker('escape', 4, 3.2);
    this.fx.addMarker('meow', 8, 0.5);
    this.fx.addMarker('numkey', 9, 0.1);
    this.fx.addMarker('ping', 10, 1.0);
    this.fx.addMarker('death', 12, 4.2);
    this.fx.addMarker('shot', 17, 1.0);
    this.fx.addMarker('squit', 19, 0.3);


    this.background = this.add.tileSprite(0, 0, 640, 480, 'background');
    this.background.fixedToCamera = true;
    this.trees = this.add.tileSprite(0, 364, 640, 116, 'trees');
    this.trees.fixedToCamera = true;

    // this.ground = this.add.physicsGroup();
    // this.ground.create(0, this.game.world.height - 10, 'ground');

    this.ground = this.add.sprite(0, this.game.world.height - 20, 'ground');
    this.game.physics.arcade.enableBody(this.ground);
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;
    this.ground.scale.setTo(3, 1);

    //  Platforms that don't move
    this.stationary = this.add.physicsGroup();
    this.stationary.create(0, 96, 'platform');
    this.stationary.create(632, 220, 'platform');
    this.stationary.create(1100, 300, 'platform');
    this.stationary.create(1400, 50, 'platform');
    this.stationary.create(1800, 500, 'platform');
    this.stationary.setAll('body.allowGravity', false);
    this.stationary.setAll('body.immovable', true);

    //  Platforms that move
    this.clouds = this.add.physicsGroup();
    var cloud1 = new CloudPlatform(this.game, 300, 450, 'cloud-platform', this.clouds);
    cloud1.addMotionPath([
    { x: '+200', xSpeed: 2000, xEase: 'Linear', y: '-200', ySpeed: 2000, yEase: 'Sine.easeIn' }, 
    { x: '-200', xSpeed: 2000, xEase: 'Linear', y: '-200', ySpeed: 2000, yEase: 'Sine.easeOut' }, 
    { x: '-200', xSpeed: 2000, xEase: 'Linear', y: '+200', ySpeed: 2000, yEase: 'Sine.easeIn' }, 
    { x: '+200', xSpeed: 2000, xEase: 'Linear', y: '+200', ySpeed: 2000, yEase: 'Sine.easeOut' }]);

    var cloud2 = new CloudPlatform(this.game, 800, 96, 'cloud-platform', this.clouds);
    cloud2.addMotionPath([
    { x: '+0', xSpeed: 2000, xEase: 'Linear', y: '+300', ySpeed: 2000, yEase: 'Sine.easeIn' }, 
    { x: '-0', xSpeed: 2000, xEase: 'Linear', y: '-300', ySpeed: 2000, yEase: 'Sine.easeOut' }]);

    var cloud3 = new CloudPlatform(this.game, 1300, 290, 'cloud-platform', this.clouds);
    cloud3.addMotionPath([
    { x: '+500', xSpeed: 4000, xEase: 'Expo.easeIn', y: '-200', ySpeed: 3000, yEase: 'Linear' }, 
    { x: '-500', xSpeed: 4000, xEase: 'Expo.easeOut', y: '+200', ySpeed: 3000, yEase: 'Linear' }]);


    this.door = this.add.sprite(1780, this.game.world.height - 100, 'door');
    this.game.physics.arcade.enableBody(this.door);
    this.door.body.allowGravity = false;
    this.door.body.immovable = true;
    this.door.scale.setTo(0.2, 0.2);

    /*
     * The gifts
     */
    this.gifts = game.add.group();
    this.gifts.enableBody = true;

    this.giftsCount.forEach(function (position) {
      var star = _this.gifts.create(position, 0, 'star');
      star.body.gravity.y = 300;
      star.body.bounce.y = 0.7 + Math.random() * 0.2;});


    this.scoreText = this.game.add.text(16, 16, 'Volante: 0', { fontSize: '32px', fill: '#ADED4F' });
    this.scoreText.fixedToCamera = true;

    //  The Player
    this.player = this.add.sprite(32, 0, 'dude');
    this.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;
    this.player.body.setSize(20, 32, 5, 16);
    this.player.addChild(game.make.sprite(0, 0, 'face'));
    this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    this.player.animations.add('turn', [4], 20, true);
    this.player.animations.add('right', [5, 6, 7, 8], 10, true);
    this.camera.follow(this.player);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.clouds.callAll('start');}, 

  customSep: function customSep(player, platform) {
    if (!this.locked && player.body.velocity.y > 0) {
      this.locked = true;
      this.lockedTo = platform;
      platform.playerLocked = true;
      player.body.velocity.y = 0;}}, 


  checkLock: function checkLock() {
    this.player.body.velocity.y = 0;
    //  If the player has walked off either side of the platform then they're no longer locked to it
    if (this.player.body.right < this.lockedTo.body.x || this.player.body.x > this.lockedTo.body.right) {
      this.cancelLock();}}, 


  cancelLock: function cancelLock() {
    this.wasLocked = true;
    this.locked = false;}, 

  preRender: function preRender() {
    if (this.game.paused) {
      //  Because preRender still runs even if your game pauses!
      return;}

    if (this.locked || this.wasLocked) {
      this.player.x += this.lockedTo.deltaX;
      this.player.y = this.lockedTo.y - 48;
      if (this.player.body.velocity.x !== 0) {
        this.player.body.velocity.y = 0;}}


    if (this.willJump) {
      this.willJump = false;
      if (this.lockedTo && this.lockedTo.deltaY < 0 && this.wasLocked) {
        //  If the platform is moving up we add its velocity to the players jump
        this.player.body.velocity.y = -300 + this.lockedTo.deltaY * 10;} else 
      {
        this.player.body.velocity.y = -300;}

      this.jumpTimer = this.time.time + 750;}

    if (this.wasLocked) {
      this.wasLocked = false;
      this.lockedTo.playerLocked = false;
      this.lockedTo = null;}}, 


  update: function update() {
    this.background.tilePosition.x = -(this.camera.x * 0.7);
    this.trees.tilePosition.x = -(this.camera.x * 0.9);
    this.physics.arcade.collide(this.player, this.stationary);
    this.physics.arcade.collide(this.player, this.clouds, this.customSep, null, this);
    this.physics.arcade.collide(this.gifts, this.stationary);
    this.physics.arcade.collide(this.gifts, this.ground);
    this.physics.arcade.collide(this.player, this.ground);

    this.physics.arcade.collide(this.player, this.door, this.touchDoor, null, this);

    this.physics.arcade.overlap(this.player, this.gifts, this.collectStar, null, this);

    //  Do this AFTER the collide check, or we won't have blocked/touching set
    var standing = this.player.body.blocked.down || this.player.body.touching.down || this.locked;
    this.player.body.velocity.x = 0;
    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -150;
      if (this.facing !== 'left') {
        this.player.play('left');
        this.facing = 'left';}} else 

    if (this.cursors.right.isDown) {
      this.player.body.velocity.x = 150;
      if (this.facing !== 'right') {
        this.player.play('right');
        this.facing = 'right';}} else 

    {
      if (this.facing !== 'idle') {
        this.player.animations.stop();
        if (this.facing === 'left') {
          this.player.frame = 0;} else 
        {
          this.player.frame = 5;}

        this.facing = 'idle';}}



    if (standing && this.cursors.up.isDown && this.time.time > this.jumpTimer) {
      if (this.locked) {
        this.cancelLock();}

      this.willJump = true;}


    if (this.locked) {
      this.checkLock();}}, 


  collectStar: function collectStarCb(player, star) {
    star.kill();
    this.fx.play('ping');
    this.score += 1;
    this.scoreText.text = 'Volante: ' + this.score;}, 

  touchDoor: function touchDoor() {
    if (!this.finishAnimationPlaying) {
      this.finishAnimationPlaying = true;
      if (this.giftsCount.length === this.score) {
        this.fx.play('death');
        this.finishAnimation = this.game.add.text(0, 0, 'Encontraste o volante!!!', { fontSize: '32px', fill: '#ADED4F', boundsAlignH: 'center', boundsAlignV: 'middle' });
        this.finishAnimation.fixedToCamera = true;
        this.finishAnimation.setTextBounds(0, 0, 640, 280);

        game.add.tween(this.door).to({ x: 2780 }, 1780, Phaser.Easing.Linear.None, true);
        game.add.tween(this.player).to({ x: 2780 }, 1780, Phaser.Easing.Linear.None, true);

        setTimeout((function () {
          this.music.destroy();
          restartGame();}).
        bind(this), 1000);} else 
      {
        this.fx.play('meow');
        this.unFinishAnimation = this.game.add.text(0, 0, 'Falta o volante!!!', { fontSize: '32px', fill: '#ADED4F', boundsAlignH: 'center', boundsAlignV: 'middle' });
        this.unFinishAnimation.fixedToCamera = true;
        this.unFinishAnimation.setTextBounds(0, 0, 640, 280);

        setTimeout((function () {
          this.unFinishAnimation.setText('');
          this.finishAnimationPlaying = false;}).
        bind(this), 2000);}}} };





// game.state.add('Game', PhaserGame, true);

/**
 * Starts the game.
 */
function startGame() {
  // let playerImage = playerObjImg;
  game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');
  game.state.add('Game', PhaserGame, true);}


/**
 * Restart the game.
 */
function restartGame() {
  game.state.pause('Game');
  // game.state.remove('Game');
  // game.state.destroy('Game');
  // game.state.pause('Game');
  document.querySelector('.overlay').style.display = 'initial';
  document.querySelector('#game').innerHTML = '';}


/**
 * Loads players.
 * @returns {array} The players with which we can play the game.
 */
function loadPlayers() {
  return playersFile;}


window.onload = function onLoadCb() {
  var players = loadPlayers();

  var playersWrapper = document.getElementById('players');
  players.forEach(function (playerObj) {
    var player = document.createElement('div');
    player.className = 'player';

    var playerImg = document.createElement('img');
    playerImg.src = 'assets/images/' + playerObj.img;
    var playerName = document.createElement('span');
    playerName.innerHTML = playerObj.name;
    player.appendChild(playerImg);
    player.appendChild(playerName);
    player.addEventListener('click', function addEventListenerCb(evt) {
      playerImage = playerObj.imgSmall;
      playerMusic = playerObj.music;
      evt.preventDefault();
      document.querySelector('.overlay').style.display = 'none';
      startGame(playerObj.img);});

    playersWrapper.appendChild(player);});


  var controlsWrapper = document.getElementById('controls');

  var controlsImg = document.createElement('IMG');
  controlsImg.src = 'assets/images/controls.png';
  controlsWrapper.appendChild(controlsImg);

  var controlsMove = document.createElement('SPAN');
  controlsMove.className = 'move';
  controlsMove.innerHTML = 'andar';
  controlsWrapper.appendChild(controlsMove);

  var controlsJump = document.createElement('SPAN');
  controlsJump.className = 'jump';
  controlsJump.innerHTML = 'saltar';
  controlsWrapper.appendChild(controlsJump);

  // document.getElementById('play').addEventListener('click', function (evt) {
  //   evt.preventDefault();
  //   document.querySelector('.overlay').style.display = 'none';
  //   startGame();
  // });
};
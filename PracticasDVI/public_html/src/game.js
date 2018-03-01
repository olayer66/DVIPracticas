var sprites = {
    Beer: {sx: 512,sy: 99,w: 23,h: 32,frames: 1},
    Glass: {sx: 512,sy: 131,w: 23,h: 32,frames: 1},
    NPC: {sx: 512,sy: 66,w: 33,h: 33,frames: 1},
    ParedIzda: {sx: 0,sy: 0,w: 512,h: 480,frames: 1},
    Player: {sx: 512,sy: 0,w: 56,h: 66,frames: 1},
    TapperGameplay: {sx: 0,sy: 480,w: 512,h: 480,frames: 1}
};

var enemies = {
  straight: { x: 0,   y: -50, sprite: 'NPC', health: 10, 
              E: 100 },
  ltr:      { x: 0,   y: -100, sprite: 'ParedIzda', health: 10, 
              B: 75, C: 1, E: 100, missiles: 2  }
};

var OBJECT_FONDO = 1,
    OBJECT_PLAYER = 1,
    OBJECT_PLAYER_PROJECTILE = 2,
    OBJECT_ENEMY = 4,
    OBJECT_ENEMY_PROJECTILE = 8,
    OBJECT_POWERUP = 16;

var startGame = function() {
    Game.setBoard(0,new Fondo());
    Game.setBoard(1,new TitleScreen("Tapper", "Presiona espacio para empezar",playGame));
};

var level1 = [
 // Start,   End, Gap,  Type,   Override
  [ 0,      4000,  500, 'step' ],
  [ 6000,   13000, 800, 'ltr' ],
  [ 10000,  16000, 400, 'circle' ],
  [ 17800,  20000, 500, 'straight', { x: 50 } ],
  [ 18200,  20000, 500, 'straight', { x: 90 } ],
  [ 18200,  20000, 500, 'straight', { x: 10 } ],
  [ 22000,  25000, 400, 'wiggle', { x: 150 }],
  [ 22000,  25000, 400, 'wiggle', { x: 100 }]
];



var playGame = function() {
  Game.setBoard(1,new Fondo());
  var board = new GameBoard();
  board.add(new Player());
  //board.add(new Level(level1,winGame));
  Game.setBoard(2,board);
  Game.setBoard(3,new GamePoints(0));
};

var winGame = function() {
  Game.setBoard(3,new TitleScreen("Has ganado!", 
                                  "Presiona espacio para volver a jugar",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(3,new TitleScreen("Has perdido!", 
                                  "Presiona espacio para volver a jugar",
                                  playGame));
};
//Fondo de pantalla
var Fondo=function(){
    this.setup('TapperGameplay', { x: 0,y: 0});
    this.step = function(dt) {
    };   
};
 Fondo.prototype = new Sprite();
 Fondo.prototype.type = OBJECT_FONDO;

//Variable del jugador
var Player = function() { 
  this.setup('Player', { vx: 0, vy: 0, reloadTime: 0.25, maxVel: 100 });

  this.reload = this.reloadTime;
  this.x = Game.width -  Game.playerOffset ;
  this.y = Game.height/2 ;

  this.step = function(dt) {
    if(Game.keys['up']) { 
      this.vy = this.maxVel; 
    }
    else if(Game.keys['down']) { this.vy = -this.maxVel; }
    else { this.vy = 0; }

    this.y += this.vy * dt;

    if(this.y < 0) { this.y = 0; }
    else if(this.y > Game.height - this.y) { 
      this.y = Game.height - this.h;
    }

    this.reload-=dt;
    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;

     // this.board.add(new Beer(this.x,this.y+this.h/2));
     // this.board.add(new Beer(this.x+this.w,this.y+this.h/2));
    }
  };
};

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;

Player.prototype.hit = function(damage) {
  if(this.board.remove(this)) {
    loseGame();
  }
};


var Beer = function(x,y) {
  this.setup('beer',{ vy: -700, damage: 10 });
  this.x = x - this.w/2;
  this.y = y - this.h; 
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_PLAYER_PROJECTILE;

Beer.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y < -this.h) { 
      this.board.remove(this); 
  }
};


var Enemy = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   E: 0, F: 0, G: 0, H: 0,
                                   t: 0, reloadTime: 0.75, 
                                   reload: 0 };

Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);

  this.x += this.vx * dt;
  this.y += this.vy * dt;

  var collision = this.board.collide(this,OBJECT_PLAYER);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  }
  
  if(this.y > Game.height ||
     this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};

Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      Game.points += this.points || 100;
      this.board.add(new Explosion(this.x + this.w/2, 
                                   this.y + this.h/2));
    }
  }
};

var Glass = function(x,y) {
  this.setup('Glass',{ vy: 200, damage: 10 });
  this.x = x - this.w/2;
  this.y = y;
};

Glass.prototype = new Sprite();
Glass.prototype.type = OBJECT_ENEMY_PROJECTILE;

Glass.prototype.step = function(dt)  {
  this.y += this.vy * dt;
  var collision = this.board.collide(this,OBJECT_PLAYER)
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
  } else if(this.y > Game.height) {
      this.board.remove(this); 
  }
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});


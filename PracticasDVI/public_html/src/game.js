//Carga de las imagenes(sprites)
var sprites = {
    Beer: {sx: 512,sy: 99,w: 23,h: 32,frames: 1},
    Glass: {sx: 512,sy: 131,w: 23,h: 32,frames: 1},
    NPC: {sx: 512,sy: 66,w: 33,h: 33,frames: 1},
    ParedIzda: {sx: 0,sy: 0,w: 512,h: 480,frames: 1},
    Player: {sx: 512,sy: 0,w: 56,h: 66,frames: 1},
    TapperGameplay: {sx: 0,sy: 480,w: 512,h: 480,frames: 1}
};

/*
 * @description Array con los datos base de las propiedades de las entidades
 * @returns {propiedades}
 */
var entidades = {
  pl: {sprite: 'Player', position:0},//Jugador
  e1: {sprite: 'NPC', health: 1, A: 100},//Cliente
  j1: {sprite: 'Beer', health: 1, A: 100},//Jarra llena
  j2: {sprite: 'Glass', health: 1, A: 100}//Jarra vacia
};

//Variables de control de las colisiones
var OBJECT_FONDO = 1,
    OBJECT_PARED_IZQ=2,
    OBJECT_BLOQUEO_IZQ=4,
    OBJECT_BLOQUEO_DER=8,
    OBJECT_PLAYER = 16,
    OBJECT_PLAYER_PROJECTILE = 32,
    OBJECT_ENEMY = 64,
    OBJECT_ENEMY_PROJECTILE = 128;

//Inicio del juego
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

//Inicio del partida
var playGame = function() {
  Game.setBoard(1,new Fondo());
  var board = new GameBoard();
  //Insertamos el jugador
  var jugador=entidades["pl"],override={};
  board.add(new Player(jugador,override));
  board.add(new ParedCol());
  //Posiciones de los bloqueos de la puertas
  this.posPuerta={0:{x:5,y:112},1:{x:35,y:210},2:{x:70,y:305},3:{x:100,y:400}};
  //Posiciones de los bloqueos de los findes de barra
  this.posFinBarra={0:{x:80,y:100},1:{x:112,y:197},2:{x:143,y:292},3:{x:175,y:388}};
  for(var i=0;i<4;i++){
      var bloqueo;
      //Puertas
      board.add(new BloqIzq(this.posPuerta[i].x,Game.height-this.posPuerta[i].y));
      //Fin de barra
      board.add(new BloqDer(Game.width-this.posFinBarra[i].x,Game.height-this.posFinBarra[i].y));
  }
  
  //board.add(new Level(level1,winGame));
  Game.setBoard(2,board);
  Game.setBoard(3,new GamePoints(0));
};
//Partida ganada
var winGame = function() {
  Game.stopBoard();
  Game.setBoard(3,new TitleScreen("Has ganado!", "Presiona espacio para volver a jugar",  playGame));                           
};
//Partida perida
var loseGame = function() {
  Game.stopBoard();
  Game.setBoard(3,new TitleScreen("Has perdido!", "Presiona espacio para volver a jugar", playGame));
};

/*----------------------------FONDO PANTALLA----------------------------------*/
var Fondo=function(){
    this.setup('TapperGameplay', { x: 0,y: 0}); 
    this.step=function (dt){};
};
 Fondo.prototype = new Sprite();
 Fondo.prototype.type = OBJECT_FONDO;

/*---------------------------BLOQUEO IZQUIERDO--------------------------------*/
var BloqIzq=function(x,y){
    this.setup(x,y);
    this.step=function(dt){
        var collision = this.board.collide(this,OBJECT_PLAYER_PROJECTILE);
        if(collision){
            this.board.remove(this);
            loseGame();
        }         
    };
};
BloqIzq.prototype=new Bloqueo();
BloqIzq.prototype.type=OBJECT_BLOQUEO_IZQ;

/*-----------------------------BLOQUEO DERECHO--------------------------------*/
var BloqDer=function(x,y){
    this.setup(x,y);
    this.step=function(dt){};
};
BloqDer.prototype=new Bloqueo();
BloqDer.prototype.type=OBJECT_BLOQUEO_DER;

/*---------------------------PARED IZQUIERDA----------------------------------*/
var ParedCol=function(){
     this.setup('ParedIzda', { x: 0,y: 0});
     this.tiempo=0;   
     this.step=function (dt){
         this.entra=dt*(Game.velAparicion);
         if(this.tiempo>this.entra){
            var enemy = entidades["e1"],override = { };
            this.board.add(new Enemy(enemy,override));
            this.tiempo=0;
         }else
             this.tiempo+=dt;  
    };
 };
 ParedCol.prototype = new Sprite();
 ParedCol.prototype.type = OBJECT_PARED_IZQ;
 
/*-----------------------------------JUGADOR----------------------------------*/
var Player = function(blueprint,override) { 
  this.positions={0:{x:90,y:100},1:{x:122,y:197},2:{x:153,y:292},3:{x:185,y:388}};
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
  this.x = Game.width -  this.positions[this.position].x ;
  this.y = Game.height-this.positions[this.position].y ;
};
//Parametros base de "JUGADOR"
Player.prototype.baseParameters = { position:0};

Player.prototype = new Sprite();
Player.prototype.type = OBJECT_PLAYER;
Player.prototype.step= function(dt){
    if(Game.keys['up'] && this.position<3){
        this.position++;
        Game.keys['up'] = false;
    }else if(Game.keys['down'] && this.position>0){
        this.position--;
        Game.keys['down'] = false;
    }
    this.x = Game.width -  this.positions[this.position].x ;
    this.y = Game.height-this.positions[this.position].y ;

    var collision = this.board.collide(this,OBJECT_ENEMY_PROJECTILE);
    if(collision) {
      collision.hit(this.damage);
    }

    if(Game.keys['fire']) {
      Game.keys['fire'] = false;
      //Creamos una jarra
      var jarra=entidades["j1"], override={x:this.x,y:this.y};
      this.board.add(new Beer(jarra,override));
    }
};
/*-------------------------JARRA LLENA----------------------------------------*/
var Beer = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Beer.prototype = new Sprite();
Beer.prototype.type = OBJECT_PLAYER_PROJECTILE;
//Parametros base de "JARRA LLENA"
Beer.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                  t: 0, 
                                  reloadTime: 0.75, 
                                  reload: 0 };

Beer.prototype.step = function(dt)  {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = 0;

  this.x -= this.vx*dt;
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
    Game.points += this.points || 100;
    //Creamos una jarra vacia
    var jarra=entidades["j2"], override={x:this.x,y:this.y};
    this.board.add(new Glass(jarra,override));
  }
};
Beer.prototype.hit = function(damage) {
  this.health -= damage;
  if(this.health <=0) {
    if(this.board.remove(this)) {
      
    }
  }
};

/*--------------------------------CLIENTE-------------------------------------*/
var Enemy = function(blueprint,override) {
  this.positions={0:{x:30,y:112},1:{x:65,y:210},2:{x:95,y:305},3:{x:125,y:400}};
  var p= Math.floor((Math.random() * 4) + 0);

  this.x =  this.positions[p].x ;
  this.y = Game.height-this.positions[p].y ;

  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;
//Parametros base "CLIENTE"
Enemy.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   t: 0, 
                                   reloadTime: 0.75, 
                                   reload: 0 };
//Funciones de ejecucion                              
Enemy.prototype.step = function(dt) {
  this.t += dt;

  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = 0;

  this.x += this.vx*dt;

  var collision = this.board.collide(this,OBJECT_BLOQUEO_DER);//Fin de barra
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
    loseGame();
  }
  
  if(this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
  }
};
Enemy.prototype.hit = function(damage) {
  this.health -= damage;
  this.board.remove(this);
};

/*--------------------------------JARRA VACIA---------------------------------*/
var Glass = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
};

Glass.prototype = new Sprite();
Glass.prototype.type = OBJECT_ENEMY_PROJECTILE;
//Parametros base "JARRA VACIA"
Glass.prototype.baseParameters = { A: 0, B: 0, C: 0, D: 0, 
                                   t: 0, 
                                   reloadTime: 0.75, 
                                   reload: 0 };
//Funciones de ejecucion
Glass.prototype.step = function(dt)  {
  //Movimiento
  this.t += dt;
  this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
  this.vy = 0;
  this.x += this.vx*dt;
  //Colisiones
  var collision = this.board.collide(this,OBJECT_PLAYER);
  var collisionBlq = this.board.collide(this,OBJECT_BLOQUEO_DER);
  if(collision) {
    Game.points += this.points || 100;
    this.board.remove(this);
  } else if(collisionBlq){
      this.board.remove(this);
        loseGame();
  } else if(this.y > Game.height) {
     this.board.remove(this); 
  }
};

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
//Evento de inicio del juego
window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});



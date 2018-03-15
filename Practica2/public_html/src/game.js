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
/*
 * Array que contiene la informacion para los niveles
 * @example nivel:{numEnemigos,vidasJugador,vel. cliente,vel. jarra, vel. spawn(en ms)} 
 * @returns {datosNivel} 
 */
var niveles = { 
  1:{nClientes:8,nVidas:4,velCliente:1,velJarra:1,velSpawn:100},
  2:{nClientes:16,nVidas:4,velCliente:1,velJarra:1,velSpawn:1000},
  3:{nClientes:16,nVidas:4,velCliente:1,velJarra:1,velSpawn:800},
  4:{nClientes:24,nVidas:3,velCliente:1,velJarra:1,velSpawn:800}
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
    
//Gestor del juego
var GameManager= new function(){
    //Variables de juego
    this.cerveza=0;//jarras de cerveza en pantalla
    this.jarraVacia=0;//jarras vacias en pantalla
    this.cliente=0;//clientes jugados
    this.finNivel=false;//Clientes servidos
    //Variables de nivel
    this.nivel=1;//Nivel de la partida
    this.maxClientes=0;//Maximo de clientes en el nivel
    this.vidasJugador=1;//Vidas del jugador antes de perder
    
    /*
     * @description Modifica el estado de la variable pasada
     * @param {number} accion 
     * @param {string} elem 
    */
    this.modEstado=function(accion,elem){
        switch(elem){
            case "cerveza":
                this.cerveza+=accion;
                break;
            case "jarraVacia":
                this.jarraVacia+=accion;
                break;
            case "cliente":
                this.cliente+=accion;
                break;
            case "vidasJugador":
                this.vidasJugador+=accion;
                break;
            case "finNivel":
                this.finNivel=true;
                break;
            default:
                console.log("Elemento no valido listillo");
        };
        this.estado();
    };
    /*
     * Indica el numero de vidas que tiene un jugador
     * @param {number} nVidas
     */
    this.setVidasJugador=function(nVidas){
        this.vidasJugador=nVidas;
    };
    /*
     * Indica el numero de clientes del nivel
     * @param {number} maxClientes
     */
    this.setMaxClientes=function(maxClientes){
        this.maxClientes=maxClientes;
    };
    /*
     * Establece el nivel de la partida
     * @param {number} nivel 
     */
    this.setNivel= function (nivel){
        this.nivel=nivel;
    };
    /*
     * Comprueba el estado del juego
     */
    this.estado=function(){
        if(this.jarraVacia===0 && this.cliente===0 && this.finNivel)
            winGame();
        if(this.vidasJugador===0)
            loseGame();
    };
    /*
     * Resetea las variables de juego cuando se inicia un nuevo nivel
     */
    this.resetNivel=function(){
        this.cerveza=0;
        this.cliente=0;
        this.finNivel=false;
        this.jarraVacia=0;
    };
};

//Inicio del juego
var startGame = function() {
    Game.setBoard(0,new Fondo());
    Game.setBoard(1,new TitleScreen("Tapper", "Presiona espacio para empezar",playGame));
};

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
  //Generacion del nivel
  board.add(new GenNiveles(niveles[GameManager.nivel],GameManager.estado()));
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
/*-------------------------GENERADOR DE NIVELES-------------------------------*/
var GenNiveles=function(config,callback){
    GameManager.resetNivel();
    this.velAparicion= config.velSpawn;//multiplicador de la velocidad de aparacion de los enemigos
    this.num=config.nClientes; //maximo clientes
    this.tiempo=0; //contado del tiempo que se lleva
    this.actuales=0; //contador de clientes que se han generado
    this.callback=callback;
    GameManager.setMaxClientes(this.num);
    GameManager.setVidasJugador(config.nVidas);
    
};
GenNiveles.prototype.draw=function(ctx){};
GenNiveles.prototype.step=function(dt){
    var p= Math.floor((Math.random() * 4) + 0);

    this.entra=dt*(this.velAparicion);
    if(this.actuales<this.num){
        if(this.tiempo>this.entra){
           var enemy = entidades["e1"],ov = {p: p };
           this.board.add(new Enemy(enemy,ov));
           this.tiempo=0;
           this.actuales++;
        }else
            this.tiempo+=dt;  
    }else if(!GameManager.finNivel){
        GameManager.modEstado(0,"finNivel");
    }else
        console.log("fin Spawn");
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
    this.step=function(dt){};
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
     this.step=function(dt){};
};
 ParedCol.prototype = new Sprite();
 ParedCol.prototype.type = OBJECT_PARED_IZQ;
 
/*-----------------------------------JUGADOR----------------------------------*/
var Player = function(blueprint,override) { 
  this.positions={0:{x:90,y:100},1:{x:122,y:197},2:{x:153,y:292},3:{x:185,y:388}};
  this.reloadTime = 0.5; // un cuarto de segundo
  this.reload = this.reloadTime;
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
    this.reload-=dt;
    if(Game.keys['up'] && this.position<3){
        this.position++;
        Game.keys['up'] = false;
    }else if(Game.keys['down'] && this.position>0){
        this.position--;
        Game.keys['down'] = false;
    }
    this.x = Game.width -  this.positions[this.position].x ;
    this.y = Game.height-this.positions[this.position].y ;

    if(Game.keys['fire'] && this.reload < 0) {
      Game.keys['fire'] = false;
      this.reload = this.reloadTime;
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
  GameManager.modEstado(1,"cerveza");
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
  this.points=50;
  
  this.x -= this.vx*dt;
  var collisionBloq = this.board.collide(this,OBJECT_BLOQUEO_IZQ);//Fin de barra
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    collision.hit(this.damage);
    this.board.remove(this);
    Game.points += this.points || 50;
    //Creamos una jarra vacia
    var jarra=entidades["j2"], override={x:this.x,y:this.y};
    this.board.add(new Glass(jarra,override));
    GameManager.modEstado(-1,"cerveza");
  }else if(collisionBloq) {
    this.board.remove(this);
    GameManager.modEstado(-1,"cerveza");
    GameManager.modEstado(-1,"vidasJugador");
  }
};

/*--------------------------------CLIENTE-------------------------------------*/
var Enemy = function(blueprint,override) {
  this.positions={0:{x:30,y:112},1:{x:65,y:210},2:{x:95,y:305},3:{x:125,y:400}};
  //var p= Math.floor((Math.random() * 4) + 0);

  this.x = this.positions[override.p].x ;
  this.y = Game.height-this.positions[override.p].y ;

  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
  GameManager.modEstado(1,"cliente");
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
    this.board.remove(this);
    GameManager.modEstado(-1,"vidasJugador");
    GameManager.modEstado(-1,"cliente");
  }
  //neceario??
  /*if(this.x < -this.w ||
     this.x > Game.width) {
       this.board.remove(this);
       GameManager.modEstado(-1,"cliente");
  }*/
};
Enemy.prototype.hit = function(damage) {
  this.board.remove(this);
  GameManager.modEstado(-1,"cliente");
};

/*--------------------------------JARRA VACIA---------------------------------*/
var Glass = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
  GameManager.modEstado(1,"jarraVacia");
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
  this.points=100;
  
  //Colisiones
  var collision = this.board.collide(this,OBJECT_PLAYER);
  var collisionBlq = this.board.collide(this,OBJECT_BLOQUEO_DER);
  if(collision) {
    Game.points += this.points || 100;
    this.board.remove(this);
    GameManager.modEstado(-1,"jarraVacia");
  } else if(collisionBlq){
      this.board.remove(this);
      GameManager.modEstado(-1,"jarraVacia");
      GameManager.modEstado(-1,"vidasJugador");
      //loseGame();
  }
};

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
//Evento de inicio del juego
window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});



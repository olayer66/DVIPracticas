/* global Game */

//Carga de las imagenes(sprites)
var sprites = {
    Beer: {sx: 512,sy: 99,w: 23,h: 32,frames: 1},
    Glass: {sx: 512,sy: 131,w: 23,h: 32,frames: 1},
    NPC1: {sx: 199,sy: 18,w: 32,h: 32,frames: 4},
    NPC2: {sx: 199,sy: 51,w: 32,h: 32,frames: 4},
    NPC3: {sx: 199,sy: 83,w: 32,h: 32,frames: 4},
    NPC4: {sx: 199,sy: 115,w: 32,h: 32,frames: 4},
    NPC1x: {sx: 199,sy: 147,w: 56,h: 42,frames: 3},
    NPC2x: {sx: 199,sy: 191,w: 56,h: 42,frames: 3},
    NPC3x: {sx: 199,sy: 233,w: 56,h: 42,frames: 3},
    NPC4x: {sx: 199,sy: 275,w: 56,h: 42,frames: 3},
    ParedIzda: {sx: 0,sy: 0,w: 140,h: 480,frames: 1},
    Player: {sx: 512,sy: 0,w: 56,h: 66,frames: 1},
    TapperGameplay: {sx: 0,sy: 480,w: 512,h: 480,frames: 1}
};

/*
 * @description Array con los datos base de las propiedades de las entidades
 * @returns {propiedades}
 */
var entidades = {
  pl: {sprite: 'Player', position:0},//Jugador
  e1: {sprite: 'NPC1', health: 1, A: 100},//Cliente
  j1: {sprite: 'Beer', health: 1, A: 100},//Jarra llena
  j2: {sprite: 'Glass', health: 1, A: 100}//Jarra vacia
};
/*
 * Array que contiene la informacion para los niveles
 * @example nivel:{numEnemigos,vidasJugador,vel. cliente,vel. jarra, vel. spawn(en ms)} 
 * @returns {datosNivel} 
 */
var niveles = {//Si se modifica el numero de nieveles cambiar el parametro en el GameManager 
  1:{nClientes:3,nVidas:4,velCliente:80,velJarra:100,velSpawn:100},
  2:{nClientes:12,nVidas:4,velCliente:80,velJarra:100,velSpawn:100},
  3:{nClientes:12,nVidas:4,velCliente:80,velJarra:100,velSpawn:80},
  4:{nClientes:14,nVidas:3,velCliente:100,velJarra:100,velSpawn:80},
  5:{nClientes:14,nVidas:3,velCliente:100,velJarra:100,velSpawn:80},
  6:{nClientes:14,nVidas:3,velCliente:120,velJarra:100,velSpawn:80},
  7:{nClientes:16,nVidas:3,velCliente:120,velJarra:120,velSpawn:80},
  8:{nClientes:16,nVidas:3,velCliente:120,velJarra:120,velSpawn:60},
  9:{nClientes:16,nVidas:3,velCliente:120,velJarra:120,velSpawn:60},
  10:{nClientes:16,nVidas:3,velCliente:140,velJarra:120,velSpawn:60}
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
    this.maxNivel=10;//Numero maximo de niveles
    this.cerveza=0;//jarras de cerveza en pantalla
    this.jarraVacia=0;//jarras vacias en pantalla
    this.cliente=0;//clientes jugados
    this.finNivel=false;//Clientes servidos
    this.puntos=0;//Puntuacion del jugador
    //Variables de nivel
    this.nivel=1;//Nivel de la partida
    this.maxClientes=0;//Maximo de clientes en el nivel
    this.vidasJugador=1;//Vidas del jugador antes de perder
    this.velJarra=0;//Velocidad de movimiento de la jarra
    
    this.maxPuntTapper=0;//Variable que contiene la puntuacion maxima del juego
        
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
     * Establece la velocidad base de movimiento de la jarra
     * @param {number} velJarra
     */
    this.setVelJarra=function(velJarra){
        this.velJarra=velJarra;
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
    /*
     * @description Reinicia la puntuacion del jugador
     */
    this.resetPuntos=function(){
        this.puntos=0;
    };
    /*
     * Comprueba si la puntuacion alcanzada es mayor que la maxima puntuacion obtenida del sessionStorage
     * @param {number} maxPunt
     */
    this.setMaxPuntTapper=function(){
        if(this.maxPuntTapper<this.puntos){
            this.maxPuntTapper=sessionStorage.setItem("maxPuntTapper",this.puntos);
            this.maxPuntTapper=this.puntos;
        }
    };
};
//Manager de la tabla
var TableManager= new function (){
    this.laTabla=[];
    var that=this;
    this.cargarTabla=function(){
        if(localStorage.getItem("laTabla"))
            //Problema aqui lo carga como un String
            this.laTabla=JSON.parse(localStorage.getItem("laTabla"));
        else{
            $.getJSON("src/laTabla.json")       
            .done(function( data, textStatus, jqXHR ) {
                $.each( data, function( key, val ) {
                  that.laTabla[key]=val;
                });
                that.guardarTabla();
            })
            .fail(function( jqXHR, textStatus, errorThrown ) {
                alert("Error de carga");
            });
        }
    };
    this.guardarTabla=function(){
        localStorage.setItem("laTabla",JSON.stringify(this.laTabla));
    };
    this.compPuntuacion=function(puntos){
        if(this.laTabla[9].puntos<puntos){
            var pos=9;
            if(this.laTabla[0].puntos<=puntos)
                return 0;
            else{
                while(pos>0 && this.laTabla[pos].puntos<=puntos)
                    pos--;     
                return pos+=1;
            }
        }else
            return -1;
    };
    this.insPuntos=function(pos,nombre,puntos){
        this.laTabla[pos].name=nombre;
        this.laTabla[pos].puntos=puntos;
        this.guardarTabla();
    };
};
//Inicio del juego
var startGame = function() {
    //Extraemos la puntuacion maxima del navegador
    if(sessionStorage.getItem("maxPuntTapper"))
        GameManager.maxPuntTapper=sessionStorage.getItem("maxPuntTapper");
    else
        sessionStorage.setItem("maxPuntTapper",0);
    
    //TableManager.cargarTabla();
    Game.setBoard(0,new Fondo());
    Game.setBoard(1,new FondoBase());
    Game.setBoard(2,new StartScreen(GameManager.maxPuntTapper,playGame,cargaTabla));
};
//carga la tabla
var cargaTabla=function(){
    //TableManager.guardarTabla();
    Game.setBoard(0,new Fondo());
    Game.setBoard(1,new FondoBase());
    Game.setBoard(2,new laTabla(TableManager.laTabla,startGame));
};
//Inicio del partida
var playGame = function() {
    Game.setBoard(0,new Fondo());
    
    //Generacion del board
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
    Game.setBoard(1,board);
    Game.setBoard(2,new GamePoints(GameManager.puntos));
};
//Partida ganada
var winGame = function() {
  Game.stopBoard();
  if(GameManager.nivel<=GameManager.maxNivel){
      GameManager.nivel++;
      
      Game.setBoard(2,new TitleScreen("Nivel superado!", "Presiona espacio para iniciar el nivel "+GameManager.nivel,playGame));
      
  }else
    Game.setBoard(2,new TitleScreen("Has ganado!", "Presiona espacio para volver a jugar",playGame));                           
};
//Partida perida
var loseGame = function() {
  Game.stopBoard();
  GameManager.setMaxPuntTapper();
  this.record=false;
  this.pos=TableManager.compPuntuacion(GameManager.puntos);
  if(this.pos>=0){
      this.record=true;
      TableManager.insPuntos(this.pos,"JLS",GameManager.puntos);
  }
  GameManager.nivel=1;
  GameManager.puntos=0;
  Game.setBoard(0,new Fondo());
  Game.setBoard(1,new FondoBase());
  Game.setBoard(2,new LoseScreen(this.record,0,0,startGame));
};
/*-------------------------GENERADOR DE NIVELES-------------------------------*/
var GenNiveles=function(config,callback){
    GameManager.resetNivel();
    this.velAparicion= config.velSpawn;//multiplicador de la velocidad de aparacion de los enemigos
    this.velCliente=config.velCliente;//Velocidad de movimiento del cliente
    this.num=config.nClientes; //maximo clientes
    this.tiempo=0; //contado del tiempo que se lleva
    this.actuales=0; //contador de clientes que se han generado
    this.callback=callback;
    
    GameManager.setMaxClientes(this.num);
    GameManager.setVidasJugador(config.nVidas);
    GameManager.setVelJarra(config.velJarra);
    
};
GenNiveles.prototype.draw=function(ctx){};
GenNiveles.prototype.step=function(dt){
    var p= Math.floor((Math.random() * 4) + 0);

    this.entra=dt*(this.velAparicion);
    if(this.actuales<this.num){
        if(this.tiempo>this.entra){
        let n= Math.floor((Math.random() * 4) + 1);
           var enemy = entidades["e1"],ov = {p: p, frame:0,vx:this.velCliente, vy:this.velCliente};
           enemy.sprite='NPC'+n;
           this.board.add(new Enemy(enemy,ov));
           this.tiempo=0;
           this.actuales++;
        }else
            this.tiempo+=dt;  
    }else if(!GameManager.finNivel){
        GameManager.modEstado(0,"finNivel");
    }
};
/*----------------------------FONDO PANTALLA----------------------------------*/
var Fondo=function(){
    this.setup('TapperGameplay', { x: 0,y: 0}); 
    this.step=function (dt){};
};
 Fondo.prototype = new Sprite();
 Fondo.prototype.type = OBJECT_FONDO;
var FondoBase=function(){
    this.step=function (dt){};
};
FondoBase.prototype = new FondoScreen();
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
      var jarra=entidades["j1"], override={x:this.x,y:this.y,vx:GameManager.velJarra};
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
Beer.prototype.baseParameters = { vx:0,
                                  reloadTime: 0.75, 
                                  reload: 0 };

Beer.prototype.step = function(dt)  {
  this.t += dt;
  
  this.points=50;
  
  this.x -= this.vx*dt;
  var collisionBloq = this.board.collide(this,OBJECT_BLOQUEO_IZQ);//Fin de barra
  var collision = this.board.collide(this,OBJECT_ENEMY);
  if(collision) {
    this.board.remove(this);
    Game.points += this.points || 50;
    GameManager.puntos += this.points || 50;
    //Creamos una jarra vacia
    var jarra=entidades["j2"], override={x:this.x,y:this.y,vx:GameManager.velJarra};
    this.board.add(new Glass(jarra,override));
    GameManager.modEstado(1,"jarraVacia");
    GameManager.modEstado(-1,"cerveza");
    collision.hit(this.damage);
  }else if(collisionBloq) {
    this.board.remove(this);
    GameManager.modEstado(-1,"vidasJugador");
    GameManager.modEstado(-1,"cerveza");

  }
};

/*--------------------------------CLIENTE-------------------------------------*/
var Enemy = function(blueprint,override) {
  this.positions={0:{x:30,y:112},1:{x:65,y:208},2:{x:95,y:303},3:{x:125,y:399}};
  //var p= Math.floor((Math.random() * 4) + 0);
  this.x = this.positions[override.p].x ;
  this.y = Game.height-this.positions[override.p].y ;

  this.merge(this.baseParameters);
  //sprite enemigo random

  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
  GameManager.modEstado(1,"cliente");
  
  this.back=false; //steps hacia atras 
  this.cont=0;
};

Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;
//Parametros base "CLIENTE"
Enemy.prototype.baseParameters = {vx:0,
                                  t: 0, 
                                  reloadTime: 0.75, 
                                  reload: 0,
                                  frame:0};
//Funciones de ejecucion                              
Enemy.prototype.step = function(dt) {
  this.t += dt;
  if(Math.trunc( this.t*10)%9===0){
    if(this.back && this.frame<2)
        this.frame++;
    else if(!this.back && this.frame<3)
        this.frame++;
    else if(this.frame>0)
        this.frame--;
  }
  
  if(!this.back) this.x += this.vx*dt;
  else if (this.cont<150){
    this.x -= this.vy*dt;
    this.cont++;
  } 
  else{
    this.cont=0;
    this.back=false;
    this.change();
  } 

  var collision = this.board.collide(this,OBJECT_BLOQUEO_DER);//Fin de barra 
  var collisionIZQ = this.board.collide(this,OBJECT_BLOQUEO_IZQ);//Fin de barra izquierda
  if(collision){
    this.board.remove(this);
    GameManager.modEstado(-1,"vidasJugador");
    GameManager.modEstado(-1,"cliente");
  }
  else if(this.back && collisionIZQ){
    this.board.remove(this);
    GameManager.modEstado(-1,"cliente");
    Game.points += this.points || 100;
    GameManager.puntos += this.points || 100;
  }
};


Enemy.prototype.hit = function(damage) {
    this.back=true;
    this.change();
    this.frame=0;
  //this.board.remove(this);
  //GameManager.modEstado(-1,"cliente");
};

/*--------------------------------JARRA VACIA---------------------------------*/
var Glass = function(blueprint,override) {
  this.merge(this.baseParameters);
  this.setup(blueprint.sprite,blueprint);
  this.merge(override);
  this.vx+=this.vx/10;//Aumentamos la velocidad de la jarra vacia respecto a una llena
};

Glass.prototype = new Sprite();
Glass.prototype.type = OBJECT_ENEMY_PROJECTILE;
//Parametros base "JARRA VACIA"
Glass.prototype.baseParameters = { vx:0,
                                   reloadTime: 0.75, 
                                   reload: 0 };
//Funciones de ejecucion
Glass.prototype.step = function(dt)  {
  //Movimiento
  this.t += dt;
  
  this.x += this.vx*dt;
  this.points=100;
  //Colisiones
  var collision = this.board.collide(this,OBJECT_PLAYER);
  var collisionBlq = this.board.collide(this,OBJECT_BLOQUEO_DER);
  if(collision) {
    Game.points += this.points || 100;
    GameManager.puntos += this.points || 100;
    this.board.remove(this);
    GameManager.modEstado(-1,"jarraVacia");
  } else if(collisionBlq){
      this.board.remove(this);
      GameManager.modEstado(-1,"vidasJugador");
      GameManager.modEstado(-1,"jarraVacia");
      
  }
};

/*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
//Evento de inicio del juego
window.addEventListener("load", function() {
  TableManager.cargarTabla();
  Game.initialize("game",sprites,startGame);
});
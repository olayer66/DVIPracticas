/*---------------------------CARGA DE QUINTUS---------------------------------*/
var SPRITE_PLAYER = 1;
var SPRITE_TILES = 2;
var SPRITE_ENEMY = 4;
var SPRITE_FLAG = 8;
var SPRITE_COIN = 16;
var SPRITE_SENSOR = 32;

/* global Quintus */
var Q = window.Q = Quintus({ development:true,audioSupported: ['ogg','mp3'] })
                .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI,TMX,Audio")//Librerias del quintus cargadas
                .setup({ maximize: "touch",
                         width:   800,// Set the default width to 800 pixels
                         height:  600,// Set the default height to 600 pixels
                         upsampleWidth:  420,// Double the pixel density of the
                         upsampleHeight: 320,// game if the w or h is 420x320
                         downsampleWidth: 1024,// Halve the pixel density if resolution
                         downsampleHeight: 768// is larger than or equal to 1024x768
                })// Maximiza la pantalla en Disp. moviles
                .controls().touch()//Controles tanto para PC como para Disp. moviles
                .enableSound();//Habilita el uso de audio
//*-------------------------CARGA DE CONTENIDO--------------------------------*/
Q.input.keyboardControls({
    P: "pausa"
});
//Modo de pausa del juego
Q.input.on("pausa",function() {
    if(Q.state.get("enJuego")){
        if(Q.state.get("pause")) {
            Q.state.set("pause",false);
            Q.audio.play('music_main.ogg',{ loop:true});
            Q.stage().unpause();
            Q.clearStage(3);
        }else{
            Q.state.set("pause",true);
            Q.audio.stop();
            Q.audio.play('pause.ogg',{debounce:500});
            Q.stage().pause();
            Q.stageScene("pauseMessage",3);
        }
    }
  });
//Imagenes
Q.preload(["bg.png","bloopa.png","coin.png","empty.png","goomba.png","main_title.png","mario_small.png","piranha.png","princess.png","flag.png"]);
//JSON'S (falta crear el de piranha.png)
Q.preload(["mario_small.json","coin.json","bloopa.json","goomba.json"]);
//Musica
Q.preload(["music_main.ogg","music_underground.ogg","jump_small.ogg","kill_enemy.ogg","music_die.ogg","hit_head.ogg","coin.ogg","music_level_complete.ogg","pause.ogg","down_pipe.ogg"]);
//Funcion de inicio

Q.preload(function(){
    Q.compileSheets("tiles.png","tiles.json");
    Q.compileSheets("mario_small.png","mario_small.json");
    Q.compileSheets("bloopa.png","bloopa.json");
    Q.compileSheets("goomba.png","goomba.json");
    Q.compileSheets("coin.png","coin.json");
    Q.state.set({ score: 0, lives: 0,coins:0, //Puntuaciones
                  pause:false,enJuego:false,//Estados del juego
                  valCoin:10,valEnemy:100,valBandera:600,valFinNivel:400,//Puntos por accion
                  world:1,level:1,maxWorld:1//Control de niveles
    });
    Q.loadTMX("mainMenu.tmx", function() {
    Q.stageScene("initScreen");
    });
});

/*-----------------------------ANIMACIONES----------------------------------*/

Q.animations('Mario', {
  run_right: { frames: [0,1,2], rate: 1/5}, 
  run_left: { frames: [15,16,17], rate:1/5 },
  fire_right: { frames: [9,10,10], next: 'stand_right', rate: 1/30, trigger: "fired" },
  fire_left: { frames: [20,21,21], next: 'stand_left', rate: 1/30, trigger: "fired" },
  stand_right: { frames: [0], rate: 1 },
  stand_left: { frames: [14], rate: 1},
  fall_right: { frames: [2], loop: false },
  fall_left: { frames: [14], loop: false },
  jump_right: { frames: [3,4,5,6], rate: 1/2,loop: false},
  jump_left: { frames: [18,19,20,21], rate: 1/2,loop: false}
});

Q.animations('Bloopa', {
    bloopa: { frames: [0,1], rate: 1/2 },
    bloopaDie: { frames: [2,3], rate: 1/3},
    bloopaDieStop: { frames: [2], rate: 1}
  });
Q.animations('Goomba', {
    goomba: { frames: [0,1], rate: 1/3},
    goombaDie: { frames: [1,2,3], rate: 1/3},
    goombaDieStop: { frames: [3], rate: 1}

});

Q.animations('Coin', {
    coin: { frames: [0,1,2], rate: 1/2}
});

/*--------------------------------ENEMIGOS------------------------------------*/

Q.Sprite.extend("Bloopa",{ 
    init: function(p) { 
        this._super(p, { 
            sheet: "bloopa",
            sprite:"Bloopa",
            frame: 0,
            vx:100,
            die: false,
            muerteCont: 0,
            type: SPRITE_ENEMY,
            collisionMask: SPRITE_PLAYER | SPRITE_TILES
        }); 
        //this.add("2d,aiBounce");
        this.add("2d,aiBounce,animation");
        this.play("bloopa");
    },
    muerte:function() {
      Q.audio.play('kill_enemy.ogg');
      Q.state.inc("score",Q.state.get("valEnemy"));
      this.play("bloopaDie");
      this.die=true;
      this.muerteCont=0;
      this.vx=0;
      this.p.vx=0;
      this.del("aiBounce");
      this.p.type=SPRITE_TILES; //asi si toca  amrio no perdemos.
    },
    step:function(){

        if(this.die) 
            this.muerteCont++;
        if(this.muerteCont===15) this.play("bloopaDieStop");
        else if(this.muerteCont===25)
            this.destroy();
    }
}); 

Q.Sprite.extend("Goomba",{ 
    init: function(p) { 
        this._super(p, { 
            vx:100,
            sheet: "goomba",
            sprite: "Goomba",
            frame: 0,
            die: false,
            muerteCont:0,
            type: SPRITE_ENEMY,
            collisionMask: SPRITE_PLAYER | SPRITE_TILES
        }); 
        this.add("2d,aiBounce,animation");  
        this.play("goomba");      
    },
    muerte:function() {
        Q.audio.play('kill_enemy.ogg');
        Q.state.inc("score",Q.state.get("valEnemy"));
        this.play("goombaDie");
        this.die=true;
        this.muerteCont=0;
        this.vx=0;
        this.p.vx=0;
        this.del("aiBounce");
        this.p.type=SPRITE_TILES; //asi si toca  amrio no perdemos.
      },
      step:function(){
          if(this.die) 
              this.muerteCont++;
          if(this.muerteCont===20) this.play("goombaDieStop");
          else if(this.muerteCont===25)
                  this.destroy();
      }
}); 

Q.Sprite.extend("Piranha",{ 
    init: function(p) { 
        this._super(p, { 
            hitPoints: 10, 
            damage: 5, 
            x: 5, 
            y: 1,
            sheet: "piranha",
            frame: 0,
            type: SPRITE_ENEMY,
            collisionMask: SPRITE_PLAYER | SPRITE_TILES | SPRITE_ENEMY
        }); 
        this.add("2d,aiBounce");        
    }
});

/*--------------------------------OTROS---------------------------------------*/
//Bandera
Q.Sprite.extend("Flag",{ 
    init: function(p) { 
        this._super(p, { 
            asset: "flag.png",
            type: SPRITE_FLAG,
            goDown:false,
            limInf:0,
            gravity:0,
            vy:0,
            collisionMask: SPRITE_PLAYER
        });
        this.add("2d");
        this.on("bump.top,bump.left",this,"captura");
    },
    step:function(){
        if(this.p.goDown && this.p.y<this.p.limInf){
                this.p.y+=7;
        }   
    },
    captura:function(){
        this.del("2d");
        Q.state.inc("score",Q.state.get("valBandera"));
    }
});
//Monedas
Q.Sprite.extend("Coin",{
    init:function(p){
        this._super(p,{
            sheet: "coin",
            sprite:"Coin",
            frame: 0,
            gravity:0,
            vy:0,
            type: SPRITE_COIN,
            collisionMask: SPRITE_PLAYER
        });
        this.add("2d,animation");
        this.play("coin");
        
    },
    cojer: function(){
        Q.audio.play('coin.ogg');
        Q.state.inc("score",Q.state.get("valCoin"));
        Q.state.inc("coins",1);
        this.destroy();
    }
});
//Sensor de posicion
Q.Sprite.extend("Sensor",{
    init:function(p){
        this._super(p,{
            asset:"empty.png",
            x:0,
            y:0,
            //Posiciones del punto de origen
            orX:0,
            orY:0,
            //Posiciones del punto de destino
            destX:0,
            destY:0,
            hidden:false,
            type: SPRITE_SENSOR
        }); 
        this.add("2d");
        this.on("bump.bottom",this,"stomp");
        this.p.gravity=0;
    },
    stomp: function(collision) {
      this.p.vy = 0; // make the player jump
  }
});
/*-------------------------------JUGADOR--------------------------------------*/
Q.Sprite.extend("Mario",{
    init:function(p) {
        this._super(p, {
            sheet:"marioR",
            sprite:"Mario",
            frame:0,
            lifes:1,
            suelo:true,
            agachado:false,
            bandera:false,
            auto:false,
            type:SPRITE_PLAYER
        });
        this.add("2d,animation");
        if(this.p.auto)
            this.add("aiBounce");
        else
            this.add("platformerControls");
        this.on("bump.bottom",this,"stompB");
        this.on("bump.right",this,"stompR");
        this.on("bump.left",this,"stompL");
        this.on("bump.top",this,"stompT");
    },
    stompB:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) {
           collision.obj.muerte();
           this.p.vy = -300;// make the player jump
        }else if(collision.obj.p.type===SPRITE_COIN){
            collision.obj.cojer();
        } 
        else if(collision.obj.isA("TileLayer")){
            this.p.suelo=true;
            this.colMapa(collision,"Down");
        }
    },
    stompR:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.p.type===SPRITE_COIN){
            collision.obj.cojer();
        }else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"Right");
        
    },
    stompL:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.p.type===SPRITE_COIN){
            collision.obj.cojer();
        } 
        else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"Left");
    },
    stompT:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.p.type===SPRITE_COIN){
            collision.obj.cojer();
        } 
        else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"top");
    },
    step:function(){
        //salto
        if(this.p.suelo){
            if(Q.inputs['up']) {
                this.p.gravity=0.4;
                this.p.suelo=false;
                Q.audio.play('jump_small.ogg',{debounce:500});
            } 
        }
        if(!Q.inputs['up']){
            this.p.gravity=1;
        }
        //Agacharse
        if(Q.inputs['down'] && !this.p.agachado) {
            this.p.agachado=true;
        }
        if(!Q.inputs['down']){
            this.p.agachado=false;
        }
        //animacion movimiento
        if(this.p.vx > 0) {
            if(this.p.suelo===true)
                this.play("run_right");
            else
                this.play("jump_right");
        } else if(this.p.vx < 0) {
            if(this.p.suelo===true)
                this.play("run_left");
            else
                this.play("jump_left");
        } else {
            if(this.p.direction ==="right")
                this.play("stand_right");
            else 
                this.play("stand_left");
        }
        //Fin animacion movimiento
        //limite inferior mapa
        if(this.p.y>this.p.limInfMapa){
            if(this.p.vx > 0)
                this.play("fall_right");
            else if(this.p.vx < 0)
                this.play("fall_left");
            this.muerte();
        }
    },
    muerte:function(){
        Q.audio.stop();
        Q.audio.play('music_die.ogg');
        this.destroy();
        Q.loadTMX("endGame.tmx", function() {
        Q.stageScene("loseScreen",{label:"Has perdido"});
    });
    },
    colMapa:function(collision,tipo){
        if(collision.tile === 37 && tipo==="top") { //caja llena
                collision.obj.setTile(collision.tileX,collision.tileY, 24); 
                Q.audio.play('hit_head.ogg');
                Q.audio.play('coin.ogg');
                Q.state.inc("score",Q.state.get("valCoin"));
        }else if((collision.tile === 24 ||collision.tile === 44) && tipo==="top") { //Caja vacia
            Q.audio.play('hit_head.ogg');
        }else if(collision.tile === 38 ||collision.tile === 45) { //Mastil de la bandera     
            //Eliminamos la colision contra el mastil (tile = 0 es empty)
            this.p.bandera=true;
            var bandera=Q("Flag");
            bandera.each(function() {
                this.p.goDown=true;
            });
            Q.state.inc("score",Q.state.get("valFinNivel"));
            collision.obj.setTile(collision.tileX,15, 0);
            collision.obj.setTile(collision.tileX,14, 0);
            collision.obj.setTile(collision.tileX,13, 0);
            collision.obj.setTile(collision.tileX,12, 0);
            collision.obj.setTile(collision.tileX,11, 0);
            collision.obj.setTile(collision.tileX,10, 0);
            collision.obj.setTile(collision.tileX,9, 0);
            collision.obj.setTile(collision.tileX,8, 0);
            collision.obj.setTile(collision.tileX,7, 0);    
            this.movFin();
            
        }else if(collision.tile === 39 && this.p.bandera) { //puerta castillo
            Q.loadTMX("nextLevel.tmx", function() {
                Q.stageScene("winScreen",{label:"World "+Q.state.get("world")+" Level "+Q.state.get("level")});
            });
        }else if(collision.tile === 39 && this.p.auto) { //puerta castillo nextLevel
            Q.loadTMX("world"+Q.state.get("world")+"level"+Q.state.get("level")+".tmx", function() {
                Q.audio.play('music_main.ogg',{ loop:true});
                Q.stageScene("W"+Q.state.get("world")+"L"+Q.state.get("level"));
            });
        }else if((collision.tile === 49 || collision.tile === 50) && tipo==="Down" && this.p.agachado){//Boca tuberia vertical
            var bandera=Q("Sensor");
            var that=this;
            Q.audio.stop("music_main.ogg")
            Q.audio.play("music_underground.ogg",{loop:true});
            bandera.each(function() {
                that.goDown(this.p.destX,this.p.destY);
            });
        }else if(collision.tile === 5 || collision.tile === 12 && tipo==="Right"){//Boca tuberia horizontal
            var bandera=Q("Sensor");
            var that=this;
            Q.audio.stop("music_underground.ogg");
            Q.audio.play("music_main.ogg",{loop:true});
            bandera.each(function() {
                that.goDown(this.p.orX,this.p.orY);
            });
        }
    },
    movFin:function(){
        this.changeLevel();
        Q.audio.stop("music_main.ogg");
        Q.audio.play('music_level_complete.ogg',{debounce:10000});
        this.p.vx=50;
        this.del("platformerControls");
        this.add("aiBounce");
    },
    goDown:function(destX,destY){
        Q.audio.play('down_pipe.ogg',{debounce:100});
        this.p.x=destX;
        this.p.y=destY;
    },
    changeLevel:function(){
        if(Q.state.get("level")===4){
            if(Q.state.get("world")===Q.state.get("maxWorld")){
                Q.loadTMX("nextLevel.tmx", function() {
                    Q.stageScene("winScreen",{label:"Has ganado!"});
                });
            }else{
                Q.state.inc("world",1);
                Q.state.set("level",1);
            }
        }else
            Q.state.inc("level",1);
    }
});
/*----------------------------------HUD---------------------------------------*/
//Puntuacion
Q.UI.Text.extend("Score",{
    init:function(p) {
        this._super({
            label: "Mario\n 0",    
            x: 100,
            y: 0,
            color:"#ffffff"
            });
        Q.state.on("change.score",this,"score");
    },
    score:function(score) {
        this.p.label = "Mario\n " + score;
    }
});
//vidas
Q.UI.Text.extend("Lives",{
    init:function(p) {
        this._super({
            label: "vidas\n 4",    
            x: 500,
            y: 0,
            color:"#ffffff"
            });
        Q.state.on("change.lives",this,"lives");
    },
    lives:function(lives) {
        this.p.label = "vidas\n " + lives;
    }
});
//Monedas
Q.UI.Text.extend("Coins",{
    init:function(p) {
        this._super({
            label: "monedas\n 0",    
            x: 300,
            y: 0,
            color:"#ffffff"
            });
        Q.state.on("change.coins",this,"coins");
    },
    coins:function(coins) {
        this.p.label = "monedas\n " + coins;
    }
});
//Escena del HUD
Q.scene('HUD',function(stage) {
  var container = stage.insert(new Q.UI.Container({x:0, y:10, fill: "rgba(0,0,0,0.5)"}));
  container.insert(new Q.Score());
  container.insert(new Q.Coins());
  container.insert(new Q.Lives());
});
/*------------------------------ESCENAS BASE----------------------------------*/
//Pantalla de inicio
Q.scene("initScreen",function(stage){
    Q.state.set("enJuego",false);
    Q.stageTMX("mainMenu.tmx",stage);
    stage.insert(new Q.UI.Text({x:Q.width/2, y: (Q.height/3)*2-80,size:32,color: "#ffffff",label: "Pulsa enter para empezar" }));
    stage.insert(new Q.UI.Button({asset:"main_title.png",x:Q.width/2, y: (Q.height/3)}));
    stage.insert(new Q.Mario({x:(3*34),y:13*34,limInfMapa:17*34,auto:true,vx:80}));
    //Musica principal del juego
    Q.audio.play('music_main.ogg',{ loop:true});
    Q.input.on("confirm",this,function(){
            Q.audio.play('coin.ogg');
            Q.state.set("lives",4);
            Q.loadTMX("world1level1.tmx", function() {
                Q.stageScene("W1L1");
                Q.stageScene("HUD",2);
                Q.input.off("confirm");
            });
    });
});
//Pantalla de perdido
Q.scene("loseScreen",function(stage){
    Q.state.set("enJuego",false);
    Q.stageTMX("endGame.tmx",stage);
    stage.insert(new Q.UI.Text({x:Q.width/2, y: Q.height/2-100,size:32,color: "#ffffff",label: stage.options.label }));
    stage.insert(new Q.Goomba({x:(1*34),y:13*34,vx:80}));
    stage.insert(new Q.Goomba({x:(23*34),y:13*34,vx:-80}));
});
//Pantalla de ganado
Q.scene("winScreen",function(stage){
    Q.state.set("enJuego",false);
    Q.stageTMX("nextLevel.tmx",stage);
    stage.insert(new Q.UI.Text({x:Q.width/2, y: Q.height/2-100,size:32,color: "#ffffff",label: stage.options.label }));
    stage.insert(new Q.Mario({x:(1*34),y:13*34,limInfMapa:17*34,auto:true,vx:80}));
});
//Mensaje de juego pausado
Q.scene('pauseMessage',function(stage) {
  var container = stage.insert(new Q.UI.Container({x: Q.width/2, y: Q.height/2, fill: "rgba(66,66,66,0.5)"}));        
  container.insert(new Q.UI.Text({x:0, y: 10,color:"#ffffff",label:"Juego pausado"}));
  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(20);
});
/*----------------------------------NIVELES-----------------------------------*/ 
/*Posicion de un sprite
     * y= (numTileY*TamTile) + [tamTile/2]
     * x= (numTileX*TamTile) + [tamTile/2]
     */
//Nivel de testing
Q.scene("level1",function(stage) {
    var mario= new Q.Mario({x:(19*34)-17,y:15*34,limInfMapa:17*34});
    //Sprites a insertar en el mapa
    var levelAssets = [
                //Bandera final
                ["Flag", {x:102*34, y: (10*34)-15,limInf:(14*34)+14}],
                //Enemigos
                //["Bloopa", {x: 25*34, y: 15*34}],
               // ["Bloopa", {x: 25*34, y: 15*34}],
                ["Goomba", {x: 27*34, y: 15*34}],
                //Sensor de la tuberia a la cueva
                ["Sensor", {x: (56*34), y: (15*34),destX:(136*34)-17,destY:11*34}],
                //Cueva del tesoro(2 grupos x 3 altura x 6 monedas/fila)(inicio en 139,6)
                //Grupo arriba
                //fila 1
                ["Coin", {x: (139*34)+17, y: (8*34)+17}],
                ["Coin", {x: (140*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (141*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (142*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (143*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (144*34)+17, y: (8*34)+17}],
                //fila 2
                ["Coin", {x: (139*34)+17, y: (9*34)+17}],
                ["Coin", {x: (140*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (141*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (142*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (143*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (144*34)+17, y: (9*34)+17}],
                //fila 3
                ["Coin", {x: (139*34)+17, y: (10*34)+17}],
                ["Coin", {x: (140*34)+17, y: (10*34)+17}], 
                ["Coin", {x: (141*34)+17, y: (10*34)+17}], 
                ["Coin", {x: (142*34)+17, y: (10*34)+17}], 
                ["Coin", {x: (143*34)+17, y: (10*34)+17}], 
                ["Coin", {x: (144*34)+17, y: (10*34)+17}],
                //Grupo abajo
                //fila 1
                ["Coin", {x: (139*34)+17, y: (12*34)+17}],
                ["Coin", {x: (140*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (141*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (142*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (143*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (144*34)+17, y: (12*34)+17}],
                //fila 2
                ["Coin", {x: (139*34)+17, y: (13*34)+17}],
                ["Coin", {x: (140*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (141*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (142*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (143*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (144*34)+17, y: (13*34)+17}],
                //fila 3
                ["Coin", {x: (139*34)+17, y: (14*34)+17}],
                ["Coin", {x: (140*34)+17, y: (14*34)+17}], 
                ["Coin", {x: (141*34)+17, y: (14*34)+17}], 
                ["Coin", {x: (142*34)+17, y: (14*34)+17}], 
                ["Coin", {x: (143*34)+17, y: (14*34)+17}], 
                ["Coin", {x: (144*34)+17, y: (14*34)+17}]      
            ];
    Q.state.set("enJuego",true);
    //Cargamos el mapa
    Q.stageTMX("level.tmx",stage);
    //Insertamos todos los sprites del nivel
    stage.loadAssets(levelAssets);
    //Insertamos a mario
    stage.insert(mario);
    stage.add("viewport").follow(mario,{x:true,y:false});
});
//World 1 level 1
Q.scene("W1L1",function(stage) {
    var mario= new Q.Mario({x:(15*34)-17,y:15*34,limInfMapa:17*34});
    //Sprites a insertar en el mapa
    var levelAssets = [
        ["Flag", {x:(120*34)+1, y: (8*34)+17,limInf:(14*34)+14}],
        //Sensor de la tuberia a la cueva
        ["Sensor", {orX:53*34,orY:12*34,destX:(160*34)-17,destY:9*34}],
        //Enemigos
        ["Bloopa", {x: (68*34)+17, y: 15*34}],
        ["Goomba", {x: (30*34)+17, y: 15*34}],
        ["Goomba", {x: (50*34)+17, y: 15*34}],
        ["Goomba", {x: (51*34)+17, y: 15*34}],
        ["Goomba", {x: (54*34)+17, y: 15*34}],
        ["Goomba", {x: (55*34)+17, y: 15*34}],
        ["Goomba", {x: (84*34)+17, y: 15*34}],
        ["Goomba", {x: (85*34)+17, y: 15*34}],
        //Cueva del tesoro
        //Grupo arriba
                //fila 1
                ["Coin", {x: (162*34)+17, y: (7*34)+17}],
                ["Coin", {x: (163*34)+17, y: (7*34)+17}], 
                ["Coin", {x: (164*34)+17, y: (7*34)+17}], 
                ["Coin", {x: (165*34)+17, y: (7*34)+17}], 
                ["Coin", {x: (166*34)+17, y: (7*34)+17}], 
                ["Coin", {x: (167*34)+17, y: (7*34)+17}],
                //fila 2
                ["Coin", {x: (162*34)+17, y: (8*34)+17}],
                ["Coin", {x: (163*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (164*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (165*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (166*34)+17, y: (8*34)+17}], 
                ["Coin", {x: (167*34)+17, y: (8*34)+17}],
                //fila 3
                ["Coin", {x: (162*34)+17, y: (9*34)+17}],
                ["Coin", {x: (163*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (164*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (165*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (166*34)+17, y: (9*34)+17}], 
                ["Coin", {x: (167*34)+17, y: (9*34)+17}],
                //Grupo abajo
                //fila 1
                ["Coin", {x: (162*34)+17, y: (11*34)+17}],
                ["Coin", {x: (163*34)+17, y: (11*34)+17}], 
                ["Coin", {x: (164*34)+17, y: (11*34)+17}], 
                ["Coin", {x: (165*34)+17, y: (11*34)+17}], 
                ["Coin", {x: (166*34)+17, y: (11*34)+17}], 
                ["Coin", {x: (167*34)+17, y: (11*34)+17}],
                //fila 2
                ["Coin", {x: (162*34)+17, y: (12*34)+17}],
                ["Coin", {x: (163*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (164*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (165*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (166*34)+17, y: (12*34)+17}], 
                ["Coin", {x: (167*34)+17, y: (12*34)+17}],
                //fila 3
                ["Coin", {x: (162*34)+17, y: (13*34)+17}],
                ["Coin", {x: (163*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (164*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (165*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (166*34)+17, y: (13*34)+17}], 
                ["Coin", {x: (167*34)+17, y: (13*34)+17}]
    ];
    Q.state.set("enJuego",true);
    //Cargamos el mapa
    Q.stageTMX("world1level1.tmx",stage);
    //Insertamos todos los sprites del nivel
    stage.loadAssets(levelAssets);
    //Insertamos a mario
    stage.insert(mario);
    stage.add("viewport").follow(mario,{x:true,y:false});
    stage.viewport.offsetY=240;
});
//World 1 level 2
Q.scene("W1L2",function(stage) {
    var mario= new Q.Mario({x:(15*34)-17,y:10*34,limInfMapa:17*34});
    //Sprites a insertar en el mapa
    var levelAssets = [
        //["Flag", {x:(120*34)+1, y: (8*34)+17,limInf:(14*34)+14}]
        //Sensor de la tuberia a la cueva
        
        //Enemigos
        ["Bloopa", {x: (34*34)+17, y: 13*34}],
        ["Bloopa", {x: (41*34)+17, y: 11*34}],
        ["Bloopa", {x: (81*34)+17, y: 12*34}],
        ["Bloopa", {x: (104*34)+17, y: 11*34}],
        ["Goomba", {x: (67*34)+17, y: 12*34}],
        ["Goomba", {x: (74*34)+17, y: 12*34}],
        //Monedas
        ["Coin", {x: (47*34)+17, y: (12*34)+17}],
        ["Coin", {x: (47*34)+17, y: (13*34)+17}],
        ["Coin", {x: (47*34)+17, y: (14*34)+17}],
        ["Coin", {x: (48*34)+17, y: (12*34)+17}],
        ["Coin", {x: (48*34)+17, y: (13*34)+17}],
        ["Coin", {x: (48*34)+17, y: (14*34)+17}],
        ["Coin", {x: (88*34)+17, y: (13*34)+17}],
        ["Coin", {x: (88*34)+17, y: (14*34)+17}]
    ];
    Q.state.set("enJuego",true);
    //Cargamos el mapa
    Q.stageTMX("world1level2.tmx",stage);
    //Insertamos todos los sprites del nivel
    stage.loadAssets(levelAssets);
    //Insertamos a mario
    stage.insert(mario);
    stage.add("viewport").follow(mario,{x:true,y:false});
    stage.viewport.offsetY=100;
});
//World 1 level 3
Q.scene("W1L3",function(stage) {
    var mario= new Q.Mario({x:(15*34)-17,y:15*34,limInfMapa:17*34});
    //Sprites a insertar en el mapa
    var levelAssets = [
        //["Flag", {x:(120*34)+1, y: (8*34)+17,limInf:(14*34)+14}],
        //Sensor de entrada/salida de la cueva
        ["Sensor", {orX:195*34,orY:13*34,destX:(51*34)-17,destY:12*34}],
        //Enemigos
        ["Bloopa", {x: (84*34)+17, y: 15*34}],
        ["Bloopa", {x: (89*34)+17, y: 15*34}],
        ["Bloopa", {x: (114*34)+17, y: 15*34}],
        ["Bloopa", {x: (117*34)+17, y: 15*34}],
        ["Goomba", {x: (69*34)+17, y: 15*34}],
        ["Goomba", {x: (70*34)+17, y: 15*34}],
        ["Goomba", {x: (106*34)+17, y: 15*34}],
        ["Goomba", {x: (105*34)+17, y: 15*34}],
        ["Goomba", {x: (136*34)+17, y: 15*34}],
        ["Goomba", {x: (140*34)+17, y: 15*34}],
        ["Goomba", {x: (157*34)+17, y: 15*34}],
        //Monedas
        ["Coin", {x: (85*34)+17, y: (10*34)+17}],
        ["Coin", {x: (86*34)+17, y: (10*34)+17}],
        ["Coin", {x: (87*34)+17, y: (10*34)+17}],
        ["Coin", {x: (88*34)+17, y: (10*34)+17}],
        ["Coin", {x: (115*34)+17, y: (11*34)+17}],
        ["Coin", {x: (116*34)+17, y: (11*34)+17}],
        ["Coin", {x: (159*34)+17, y: (9*34)+17}],
        ["Coin", {x: (160*34)+17, y: (8*34)+17}],
        ["Coin", {x: (161*34)+17, y: (8*34)+17}],
        ["Coin", {x: (162*34)+17, y: (8*34)+17}],
        ["Coin", {x: (163*34)+17, y: (9*34)+17}]
    ];
    Q.state.set("enJuego",true);
    //Cargamos el mapa
    Q.stageTMX("world1level3.tmx",stage);
    //Insertamos todos los sprites del nivel
    stage.loadAssets(levelAssets);
    //Insertamos a mario
    stage.insert(mario);
    stage.add("viewport").follow(mario,{x:true,y:false});
    stage.viewport.offsetY=240;
});

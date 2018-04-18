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
//Imagenes
Q.preload(["bg.png","bloopa.png","coin.png","empty.png","goomba.png","mainTitle.png","mario_small.png","piranha.png","princess.png","flag.png"]);
//JSON'S (falta crear el de piranha.png)
Q.preload(["mario_small.json","coin.json","bloopa.json","goomba.json"]);
//Musica
Q.preload(["music_main.ogg","jump_small.ogg","kill_enemy.ogg","music_die.ogg","hit_head.ogg","coin.ogg","music_level_complete.ogg","pause.ogg","down_pipe.ogg"]);
//Funcion de inicio

Q.preload(function(){
    Q.compileSheets("tiles.png","tiles.json"); //nuevo
    Q.compileSheets("mario_small.png","mario_small.json");
    Q.compileSheets("bloopa.png","bloopa.json");
    Q.compileSheets("goomba.png","goomba.json");
    Q.compileSheets("coin.png","coin.json");
    Q.state.set({ score: 50, lives: 1, pause:false });
    Q.loadTMX("level.tmx", function() {
    Q.stageScene("level1");
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
    bloopa: { frames: [0], rate: 1 },
    bloopaDie: { frames: [0,1,2], rate: 1/5}
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
        this.add("2d,aiBounce");
        this.add("2d,aiBounce,animation");
    },
    muerte:function() {
      this.play("bloopaDie");
      this.die=true;
      this.muerteCont=0;
      this.vx=0;
      this.del("aiBounce");
    },
    step:function(){
        if(this.die) 
            this.muerteCont++;
        if(this.muerteCont===150)
            this.destroy();
    }
}); 

Q.Sprite.extend("Goomba",{ 
    init: function(p) { 
        this._super(p, { 
            vx:100,
            sheet: "goomba",
            frame: 0,
            type: SPRITE_ENEMY,
            collisionMask: SPRITE_PLAYER | SPRITE_TILES
        }); 
        this.add("2d,aiBounce");        
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
Q.Sprite.extend("Flag",{ 
    init: function(p) { 
        this._super(p, { 
            asset: "flag.png",
            type: SPRITE_FLAG,
            goDown:false,
            collisionMask: SPRITE_PLAYER
        });
    },
    step:function(){
        if(this.p.goDown && this.p.y<492){
                this.p.y+=7;
        }   
    }
});
Q.Sprite.extend("Coin",{
    init:function(p){
        this._super(p,{
            sheet: "coin",
            frame: 0,
            gravity:0,
            vy:0,
            type: SPRITE_COIN,
            collisionMask: SPRITE_PLAYER
        });
        this.add("2d");
    }
});
//Sensor de posicion
Q.Sprite.extend("Sensor",{
    init:function(p){
        this._super(p,{
            asset:"empty.png",
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
            type:SPRITE_PLAYER
        });
        this.add("2d,platformerControls,animation");
        this.on("bump.bottom",this,"stompB");
        this.on("bump.right",this,"stompR");
        this.on("bump.left",this,"stompL");
        this.on("bump.top",this,"stompT");
    },stompB:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) {
            collision.obj.muerte();       
           Q.audio.play('kill_enemy.ogg');
           this.p.vy = -300;// make the player jump
        }else if(collision.obj.p.type===SPRITE_COIN){
            Q.audio.play('coin.ogg');
            collision.obj.destroy();
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
            Q.audio.play('coin.ogg');
            collision.obj.destroy();
        }else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"Right");
        
    },
    stompL:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.p.type===SPRITE_COIN){
            Q.audio.play('coin.ogg');
            collision.obj.destroy();
        } 
        else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"Left");
    },
    stompT:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.p.type===SPRITE_COIN){
            Q.audio.play('coin.ogg');
            collision.obj.destroy();
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
        //Parada del juego
        if(Q.inputs['action']){
            Q.audio.stop();
            Q.audio.play('pause.ogg',{debounce:500});
            Q.stage().pause();
            Q.stageScene("pauseMessage",2);
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
        Q.audio.stop("music_main.ogg");
        Q.audio.play('music_die.ogg');
        this.destroy();
        Q.loadTMX("endGame.tmx", function() {
        Q.stageScene("loseScreen");
    });
    },
    colMapa:function(collision,tipo){
        if(collision.tile === 37 && tipo==="top") { //caja llena
                collision.obj.setTile(collision.tileX,collision.tileY, 24); 
                Q.audio.play('hit_head.ogg');
                Q.audio.play('coin.ogg');
        }else if((collision.tile === 24 ||collision.tile === 44) && tipo==="top") { //Caja vacia
            Q.audio.play('hit_head.ogg');
        }else if(collision.tile === 38 ||collision.tile === 45) { //Mastil de la bandera     
            //Eliminamos la colision contra el mastil (tile = 0 es empty)
            collision.obj.setTile(collision.tileX,14, 0);
            collision.obj.setTile(collision.tileX,13, 0);
            collision.obj.setTile(collision.tileX,12, 0);
            collision.obj.setTile(collision.tileX,11, 0);
            collision.obj.setTile(collision.tileX,10, 0);
            collision.obj.setTile(collision.tileX,9, 0);
            collision.obj.setTile(collision.tileX,8, 0);
            this.p.bandera=true;
            var bandera=Q("Flag");
            bandera.each(function() {
                this.p.goDown=true;
            });
            this.movFin(collision);
            
        }else if(collision.tile === 39 && this.p.bandera) { //puerta castillo fin
            Q.loadTMX("nextLevel.tmx", function() {
                Q.stageScene("winScreen");
            });
        }else if((collision.tile === 49 || collision.tile === 50) && tipo==="Down" && this.p.agachado){//Boca tuberia vertical
            var bandera=Q("Sensor");
            var that=this;
            bandera.each(function() {
                that.goDown(this.p.destX,this.p.destY);
            });
        }else if(collision.tile === 5 || collision.tile === 12 && tipo==="Right"){//Boca tuberia horizontal
            var bandera=Q("Sensor");
            var that=this;
            bandera.each(function() {
                that.goDown(this.p.x,this.p.y);
            });
        }
    },
    movFin:function(collision){
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
    }
});
/*------------------------------ESCENAS BASE----------------------------------*/
//Pantalla de inicio
Q.scene("initScreen",function(stage){
    Q.stageTMX("nextLevel.tmx",stage);
    stage.insert(new Q.UI.Text({x:Q.width/2, y: Q.height/2-100,size:32,color: "#ffffff",label: "Pulsa una tecla para empezar" }));
});
//Pantalla de perdido
Q.scene("loseScreen",function(stage){
    Q.stageTMX("endGame.tmx",stage);
    stage.insert(new Q.UI.Text({x:Q.width/2, y: Q.height/2-100,size:32,color: "#ffffff",label: "Game Over!" }));
});
//Pantalla de ganado
Q.scene("winScreen",function(stage){
    Q.stageTMX("nextLevel.tmx",stage);
    stage.insert(new Q.UI.Text({x:Q.width/2, y: Q.height/2-100,size:32,color: "#ffffff",label: "Has ganado!" }));
});
//Mensaje de juego pausado
Q.scene('pauseMessage',function(stage) {
  var container = stage.insert(new Q.UI.Container({x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"}));
  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",label:"Reanudar" }));         
  var label = container.insert(new Q.UI.Text({x:0, y: -10 - button.p.h,color:"#ffffff",label:"Juego pausado"}));

  button.on("click",function() {
     Q.audio.play('music_main.ogg',{ loop:true});
     Q.stage().unpause();
     Q.clearStage(2);
  });
  // Expand the container to visibily fit it's contents
  // (with a padding of 20 pixels)
  container.fit(20);
});

/*----------------------------------NIVELES-----------------------------------*/
//Nivel de testing
Q.scene("level1",function(stage) {
    /*Posicion de un sprite
     * y= (numTileY*TamTile) + [tamTile/2]
     * x= (numTileX*TamTile) + [tamTile/2]
     */
    var mario= new Q.Mario({x:(19*34)-17,y:15*34,limInfMapa:17*34});
    //Sprites a insertar en el mapa
    var levelAssets = [
                //Bandera final
                ["Flag", {x:102*34, y: (10*34)-15}],
                //Enemigos
                //["Bloopa", {x: 25*34, y: 15*34}],
                ["Bloopa", {x: 25*34, y: 15*34}],
                //["Goomba", {x: 27*34, y: 15*34}],
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
    //Cargamos el mapa
    Q.stageTMX("level.tmx",stage);
    //Cargamos la musica principal
    //Q.audio.play('music_main.ogg',{ loop:true});
    //Insertamos todos los sprites del nivel
    stage.loadAssets(levelAssets); 
    //Insertamos a mario
    stage.insert(mario);
    stage.add("viewport").follow(mario,{x:true,y:false});
});
/*---------------------------------PRUEBAS------------------------------------*/

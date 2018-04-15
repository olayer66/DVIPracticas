/*---------------------------CARGA DE QUINTUS---------------------------------*/
var SPRITE_PLAYER = 1;
var SPRITE_TILES = 2;
var SPRITE_ENEMY = 4;
var SPRITE_FLAG = 8;
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
Q.preload(["music_main.ogg","jump_small.ogg","kill_enemy.ogg","music_die.ogg","hit_head.ogg","coin.ogg","music_level_complete.ogg"]);
//Funcion de inicio

Q.preload(function(){
    Q.compileSheets("tiles.png","tiles.json"); //nuevo
    Q.compileSheets("mario_small.png","mario_small.json");
    Q.compileSheets("bloopa.png","bloopa.json");
    Q.compileSheets("goomba.png","goomba.json");
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
/*--------------------------------ENEMIGOS------------------------------------*/


Q.Sprite.extend("Bloopa",{ 
    init: function(p) { 
        this._super(p, { 
            sheet: "bloopa",
            frame: 0,
            vx:100,
            type: SPRITE_ENEMY,
            collisionMask: SPRITE_PLAYER | SPRITE_TILES
        }); 
        this.add("2d,aiBounce");
    }
}); 

Q.Sprite.extend("Goomba",{ 
    init: function(p) { 
        this._super(p, { 
            hitPoints: 10, 
            damage: 5, 
            x: 5, 
            y: 1,
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
            collisionMask: SPRITE_FLAG 
        });
    },
    step:function(){
        if(this.p.goDown && this.p.y<492){
                this.p.y+=7;
        }   
    }
});
/*-------------------------------JUGADOR--------------------------------------*/
var salto=false;
Q.Sprite.extend("Mario",{
    init:function(p) {
        this._super(p, {
            sheet:"marioR",
            sprite:"Mario",
            frame:0,
            lifes:1,
            limInfMapa:540
        });
        this.add("2d,platformerControls,animation");
        this.on("bump.bottom",this,"stompB");
        this.on("bump.right",this,"stompR");
        this.on("bump.left",this,"stompL");
        this.on("bump.top",this,"stompT");
    },stompB:function(collision) {
        salto=false;
        if(collision.obj.p.type===SPRITE_ENEMY) {
           collision.obj.destroy();        
           Q.audio.play('kill_enemy.ogg');
           this.p.vy = -300;// make the player jump
        }
        else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"Down");
    },
    stompR:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"Right");
    },
    stompL:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"Left");
    },
    stompT:function(collision) {
        if(collision.obj.p.type===SPRITE_ENEMY) 
            this.muerte();
        else if(collision.obj.isA("TileLayer"))
            this.colMapa(collision,"top");
    },
    step:function(){
        //salto
        if(Q.inputs['up'] && salto===false) {
            this.p.gravity=0.4;
            salto=true;
            Q.audio.play('jump_small.ogg',{debounce:500});
        }
        if(!Q.inputs['up']){
            this.p.gravity=1;
        }
        //Fin salto
        //animacion moviento
        if(this.p.vx > 0) {
            if(salto===false)
                this.play("run_right");
            else
                this.play("jump_right");
        } else if(this.p.vx < 0) {
            if(salto==false)
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
        }
        else if(collision.tile === 38 ||collision.tile === 45) { //Mastil de la bandera     
            //Eliminamos la colsion contra el mastil (tile = 0 es empty)
            collision.obj.setTile(collision.tileX,14, 0);
            collision.obj.setTile(collision.tileX,13, 0);
            collision.obj.setTile(collision.tileX,12, 0);
            collision.obj.setTile(collision.tileX,11, 0);
            collision.obj.setTile(collision.tileX,10, 0);
            collision.obj.setTile(collision.tileX,9, 0);
            collision.obj.setTile(collision.tileX,8, 0);
            var bandera=Q("Flag");
            bandera.each(function() {
                this.p.goDown=true;
            });
            this.movFin(collision);
            
        }
        else if(collision.tile === 39) { //puerta castillo fin
            Q.loadTMX("nextLevel.tmx", function() {
                Q.stageScene("winScreen");
            });
        }
    },
    movFin:function(collision){
        Q.audio.stop("music_main.ogg");
        Q.audio.play('music_level_complete.ogg',{debounce:10000});
        this.p.vx=50;
        this.del("platformerControls");
        this.add("aiBounce");
    }
});
/*--------------------------------ESCENAS-------------------------------------*/
//Nivel de testing
Q.scene("level1",function(stage) {
    var mario= new Q.Mario({x:630,y:400});//x:3200//parte final mapa
    var flag = new Q.Flag({x:3468,y:322});
    var b= new Q.Bloopa({x:730,y:400});
    var a= new Q.Goomba({x:780,y:450});
    var c = new Q.Piranha();
    Q.stageTMX("level.tmx",stage);
    Q.audio.play('music_main.ogg',{ loop:true});
    stage.insert(mario);
    stage.insert(flag);
    //stage.insert(b);
    stage.add("viewport").follow(mario,{x:true,y:false});
    stage.viewport.offsetX=150;
    //stage.insert(a);
    //stage.insert(c);
    
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
/*---------------------------------PRUEBAS------------------------------------*/

/*---------------------------CARGA DE QUINTUS---------------------------------*/
var SPRITE_PLAYER = 1;
var SPRITE_TILES = 2;
var SPRITE_ENEMY = 4;
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
Q.preload(["bg.png","bloopa.png","coin.png","empty.png","goomba.png","mainTitle.png","mario_small.png","piranha.png","princess.png"]);
//JSON'S (falta crear el de piranha.png)
Q.preload(["mario_small.json","coin.json","bloopa.json","goomba.json"]);
//Musica
Q.preload(["music_main.ogg","jump_small.ogg","kill_enemy.ogg","music_die.ogg"]);
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
  stand_left: { frames: [15], rate: 1},
  fall_right: { frames: [2], loop: false },
  fall_left: { frames: [14], loop: false }
});
/*-----------------------------ENEMIGOS----------------------------------*/


Q.Sprite.extend("Bloopa",{ 
    init: function(p) { 
        this._super(p, { 
            sheet: "bloopa",
            frame: 0,
            type: SPRITE_ENEMY,
            collisionMask: SPRITE_PLAYER | SPRITE_TILES
        }); 
        this.add("2d");
    }
}); 

Q.Sprite.extend("Goomba",{ 
    init: function(p) { 
        this._super(p, { 
            hitPoints: 10, 
            damage: 5, 
            x: 5, 
            y: 1,
            sheet: "goomba",
            frame: 0,
            type: SPRITE_ENEMY,
            collisionMask: SPRITE_PLAYER | SPRITE_TILES
        }); 
        this.add("2d");        
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
        this.add("2d");        
    }
});


/*--------------------------------JUGADOR-------------------------------------*/var salto=false;
var salto=false;
var blqSalto=false;
Q.Sprite.extend("Mario",{
    init:function(p) {
        this._super(p, {
            sheet:"marioR",
            sprite:"Mario",
            frame:0,
            lifes:1
        });
        this.add("2d,platformerControls,animation");
        this.on("bump.bottom",this,"stompB");
        this.on("bump.right",this,"stompR");
        this.on("bump.left",this,"stompL");
        this.on("bump.top",this,"stompT");
    },stompB:function(collision) {
        salto=false;
        Q.audio.stop("jump_small.ogg");
        if(collision.obj.isA("Bloopa")) {
           collision.obj.destroy();        
           Q.audio.play('kill_enemy.ogg');
           this.p.vy = -300;// make the player jump
        }
    },
    stompR:function(collision) {
        if(collision.obj.isA("Bloopa")) 
            this.muerte();
    },
    stompL:function(collision) {
        if(collision.obj.isA("Bloopa")) 
            this.muerte();
    },
    stompT:function(collision) {
        if(collision.obj.isA("Bloopa")) 
            this.muerte();
    },
    step:function(){
        if(Q.inputs['up'] && salto===false) {//salto
            this.p.gravity=0.4;
            salto=true;
            Q.audio.play('jump_small.ogg');
        }
        
        if(this.p.vx > 0) {
            this.play("run_right");
        } else if(this.p.vx < 0) {
            this.play("run_left");
        } else {
            if(this.p.direction =="right")this.play("stand_right");
            else this.play("stand_left");
        }

        if(!Q.inputs['up']){
            this.p.gravity=1;
        }
    },
    muerte:function(){
        Q.audio.play('music_die.ogg');
        
        this.destroy();
    }
});
/*--------------------------------ESCENAS-------------------------------------*/
//Nivel de testing
Q.scene("level1",function(stage) {
    var mario= new Q.Mario({x:630,y:400});
    var b= new Q.Bloopa({x:730,y:400});
    var a= new Q.Goomba({x:780,y:450});
    var c = new Q.Piranha();
    Q.stageTMX("level.tmx",stage);
    //Q.audio.play('music_main.ogg',{ loop:true});
    stage.insert(mario);
    stage.insert(b);
    stage.add("viewport").follow(mario,{x:true,y:false});
    stage.viewport.offsetX=150;
    stage.insert(a);
    //stage.insert(c);
    
});
/*---------------------------------PRUEBAS------------------------------------*/
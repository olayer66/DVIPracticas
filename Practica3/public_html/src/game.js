/*---------------------------CARGA DE QUINTUS---------------------------------*/
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
Q.preload(["music_main.ogg"]);
//Funcion de inicio

Q.preload(function(){
    Q.compileSheets("tiles.png","tiles.json"); //nuevo
    Q.compileSheets("mario_small.png","mario_small.json");
    Q.compileSheets("bloopa.png","bloopa.json");
    Q.loadTMX("level.tmx", function() {
    Q.stageScene("level1");
    });
});

/*-----------------------------ENEMIGOS----------------------------------*/



Q.Sprite.extend("Bloopa",{ 
    init: function(p) { 
        this._super(p, { 
            hitPoints: 10, 
            damage: 5, 
            x: 5, 
            y: 1,
            sheet: "bloopa",
            frame: 0
        }); 
        this.add("2d");
       // this.add("platformerControls");
        
    }
}); 


/*--------------------------------JUGADOR-------------------------------------*/
Q.Sprite.extend("Mario",{
    init:function(p) {
        this._super(p, {
            sheet:"marioR",
            frame:0
        });
        this.add("2d");
        this.add("platformerControls");
        this.on("bump.bottom",this,"stomp");
    },stomp:function(collision) {
        if(collision.obj.isA("Enemy")) {
           collision.obj.destroy();
         this.p.vy = 0;// make the player jump
        }
    }
});
/*--------------------------------ESCENAS-------------------------------------*/
//Nivel de testing
Q.scene("level1",function(stage) {
    var mario= new Q.Mario({x:150,y:380});
    var b= new Q.Bloopa();
    Q.stageTMX("level.tmx",stage);
   // Q.audio.play('music_main.ogg',{ loop:true});
    stage.insert(mario);
    stage.insert(b);
    stage.add("viewport").follow(mario,{x:true,y:false});
    stage.viewport.offsetX=150;
    stage.viewport.offsetY=10000;
    
});
/*---------------------------------PRUEBAS------------------------------------*/
/*---------------------------CARGA DE QUINTUS---------------------------------*/
/* global Quintus */
var Q = window.Q = Quintus({ development:true})
                .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")//Librerias del quintus cargadas
                .setup({ maximize: "touch",
                         width:   800,// Set the default width to 800 pixels
                         height:  600,// Set the default height to 600 pixels
                         upsampleWidth:  420,// Double the pixel density of the
                         upsampleHeight: 320,// game if the w or h is 420x320
                         downsampleWidth: 1024,// Halve the pixel density if resolution
                         downsampleHeight: 768// is larger than or equal to 1024x768
                })// Maximiza la pantalla en Disp. moviles
                .controls().touch();//Controles tanto para PC como para Disp. moviles

//*-------------------------CARGA DE CONTENIDO--------------------------------*/
//Imagenes
Q.preload(["bg.png","bloopa.png","coin.png","empty.png","goomba.png","mainTitle.png","mario_small.png","piranha.png","princess.png"]);
//musica
Q.load([],function(){
    
});
//Inicio de juego
/*--------------------------------JUGADOR-------------------------------------*/
Q.Sprite.extend("Mario",{
    init:function(p) {
        this._super(p, {
            hitPoints: 10,
            damage: 5,
            x: 5,
            y: 1
        });
    }
});
/*--------------------------------ENEMIGOS------------------------------------*/

/*----------------------------------MAPA--------------------------------------*/

/*---------------------------------PRUEBAS------------------------------------*/
    var Mario= new Q.Mario();
    console.log("Prueba de texto:"+Mario.p.hitPoints);
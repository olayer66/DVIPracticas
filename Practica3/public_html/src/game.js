/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var game =function() {
    var Q = window.Q = Quintus({ development:true})
    .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")//Librerias del quintus cargadas
    .setup({ maximize:true})// Maximize this game to whatever the size of the browser is
    .controls().touch();// Turn on default input controls and touch input (for UI)
    
    //Precarga de elementos
    Q.preload([]);
    //Inicio del juego
    Q.load([],function(){
        
    });
};


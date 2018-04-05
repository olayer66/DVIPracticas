/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Game =function() {
    var Q = window.Q = Quintus({ development:true})
    .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI")//Librerias del quintus cargadas
    .setup({ maximize: "touch" });// Maximize this game to mobiles
    
    
    //Precarga de elementos
    Q.preload([]);
    //Inicio del juego
    Q.load([],function(){
        
    });
};
/*
 * Genera un numero aleatorio entre los pasados por parametros
 */
Quintus.Random = function(Q) {
Q.random = function(min,max) {
    return min + Math.random() * (max - min);
    };
};

//Evento de inicio del juego
window.addEventListener("load", function() {
    Game();
});
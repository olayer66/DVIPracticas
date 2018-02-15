/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

/**
 * Constructora de MemoryGame
 */
MemoryGame = function(gs) {
    //Array que contiene las cartas del juego
    this.cartas=[];
    //Mensaje del estado del Juego
    this.mensaje;
    //Numero de cartas encontradas
    this.nEncontradas=0;
    this.gs=gs;
  
    //Funcion que inicia el juego
    this.initGame=function(){
          var sp=['8-ball','potato','dinosaur','kronos','rocket','unicorn','guy','zeppelin'];
        
        for(i=0; i<sp.size(); i++){
             this.cartas[i]= new MemoryGameCard(sp[i]);
             this.cartas[sp.size()+i]= new MemoryGameCard(sp[i]);
        }
        
        for(i=0; i<16; i++){
            this.gs.draw(this.cartas[i].id,i);
          }
    };
    //Funcion de dibujo
    this.draw=function(){
        
    };
    //Funcion del bucle de juego
    this.loop=function(){
        
    };
    //Funcion que realiza la acciones al seleccionar una carta
    this.onClick=function (cardId){
        
    };
};



/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) {
    //Estado de la carta(0=Abajo.1=Arriba,2=encontrada)
    this.estado=0;
    this.id=id;
    
    //Funcion que da la vuelta a la carta
    this.flip=function(){
        //Si la carta esta boca a bajo
        if(estado===0){
            estado=1;
        }else{
            estado=0;
        }
    };
    //Cambia el estado  a encontrada
    this.found=function(){
        estado=2;
    };
    
    //Metodo que compara la carta con la pasada por referencia
    this.compareTo=function (otherCard){
        return id===otherCard.id;
    };
};

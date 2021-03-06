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
    this.mensaje="MemoryGameCard";
    //Numero de cartas encontradas
    this.nEncontradas=0;
    this.gs=gs;
    //primera carta seleccionada de las dos necesarias para formar pareja al clickear
    this.selected=null;
    this.block=0;
    
    //Funcion que inicia el juego
    this.initGame=function(){
          var sp=['8-ball','potato','dinosaur','kronos','rocket','unicorn','guy','zeppelin'];
        
        //Se rellena el array de cartas con 2 cartas de cada tipo
        for(i=0; i<sp.length; i++){
             this.cartas[i]= new MemoryGameCard(sp[i]);
             this.cartas[sp.length+i]= new MemoryGameCard(sp[i]);
        }
        this.loop();
    };
    //Funcion de dibujo
    this.draw=function(){
        //Se pinta el header
        if(this.nEncontradas<this.cartas.length) 
            gs.drawMessage(this.mensaje);
        else 
            gs.drawMessage("¡Has Ganado!");

        //Se pinta el tablero
        for(i=0; i<16; i++){
            if(this.cartas[i].estado===0)
                this.gs.draw("back",i);
            else
                this.gs.draw(this.cartas[i].id,i);
        }
    };
    //Funcion del bucle de juego
    this.loop=function(){
         //Se barajean las cartas
        var j, x, i;
        for (i =  this.cartas.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x =  this.cartas[i];
            this.cartas[i] =  this.cartas[j];
            this.cartas[j] = x;
        }
        var intervalId;
        var that=this;
        var prueba=function (){
            console.log(that.nEncontradas);
            that.draw();
            if(that.nEncontradas===16)
                clearInterval(intervalId);
        };
        //Iniciamos el bucle cada segundo
        intervalId = setInterval(prueba, 16);
    };
    //Funcion que realiza la acciones al seleccionar una carta
    this.onClick=function (cardId){
        
     var that=this;
     if(cardId>=0 && cardId<=15 && cardId!==null && !this.block){
        if(this.selected===null && this.cartas[cardId].estado===0){//si es la primera de las dos cartas que
            this.cartas[cardId].flip();
            this.selected= this.cartas[cardId];
        }else if(this.cartas[cardId].estado===0){ //si no pulsa una carta boca arriba
            this.cartas[cardId].flip();
            
            if(this.cartas[cardId].compareTo(this.selected)){//si son iguales se dejan boca arriba actualizando el estado
                this.cartas[cardId].found();
                this.selected.found();
                this.nEncontradas+=2;
                this.mensaje="¡Encontradas!";
                that.selected=null;
                console.log("Encontradas:"+this.nEncontradas);
            } 
            else{//si no, se las deja boca abajo
               this.block=1;
               setTimeout(function(){
                    that.selected.flip();
                    that.cartas[cardId].flip();
                    that.selected=null;
                    that.block=0;
               },750);
               
                
                this.mensaje="Vuelve a intentarlo";
            }
            

        }
    };
    }
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
        if(this.estado===0){
            this.estado=1;
        }else{
            this.estado=0;
        }
    };
    //Cambia el estado  a encontrada
    this.found=function(){
        this.estado=2;
    };
    
    //Metodo que compara la carta con la pasada por referencia
    this.compareTo=function (otherCard){
        return this.id===otherCard.id;
    };
};

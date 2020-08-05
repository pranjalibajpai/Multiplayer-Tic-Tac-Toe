var express = require('express');
var app = express();
var socket = require('socket.io');


const port = process.env.PORT || 2000;
var server = app.listen(port, function(){
	console.log("Listening to port ", port);
});

var io = socket(server);

app.use(express.static('src'));


io.on('connection', function(socket){
	console.log('Connection established to ', socket.id);
	/*
	//greeting from server
	socket.emit('greeting-from-server', {
		message: "Hello client"
	});
	
	//greeting from client
	socket.on('greeting-from-client', function(data){
		console.log(data.message);
	});
	*/
	//join game
	
	joinGame(socket);
	
	//if opponent is found then start the game
	if(getOpponent(socket)){
		socket.emit('game.begin', {
			symbol: players[socket.id].symbol
		});
		
		getOpponent(socket).emit('game.begin',{
			symbol: players[getOpponent(socket).id].symbol
		});
	}
	
	//Listens for move and emit to both clients
	socket.on('make.move', function(data){
		if(!getOpponent(socket)){
			return;
		}
		socket.emit('move.made', data);
		getOpponent(socket).emit('move.made', data);
	});
	
	//Emit event when player leaves
	socket.on('disconnect', function(){
		console.log('Disconnected ', socket.id);
		if(getOpponent(socket)){
			getOpponent(socket).emit('opponent.left');
		}
	});
	
});

//Player
var players ={};
var unmatched;

function joinGame (socket){
	
	players[socket.id] = {
		opponent: unmatched,
		symbol: 'X',
		socket: socket
	};
	
	//If any player who is present and is unmatched
	if(unmatched){
		players[socket.id].symbol = 'O';
		players[unmatched].opponent = socket.id;
		unmatched = null; //Set back unmatched to null
	}
	
	else{
		unmatched = socket.id;
	}
}

function getOpponent(socket){
	if(!players[socket.id].opponent){
		return;
	}
	else{
		return players[players[socket.id].opponent].socket;
	}
}
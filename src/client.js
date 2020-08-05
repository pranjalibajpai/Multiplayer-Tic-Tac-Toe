//var socket = io.connect("http://localhost:2000");
var socket =io();

var message = document.getElementById('playing');
/*
//Handle greeting from server
socket.on('greeting-from-server', function(data){
	message.innerText = data.message;
});

//Emit greeting from client
socket.emit('greeting-from-client', {
	message: "Hello server"
});
*/

//Player

var myTurn = true
var symbol;

function getBoardState(){
	var obj = {};
	$('.board button').each(function(){
		obj[$(this).attr('id')] = $(this).text() || ' ';
	});
	
	return obj;
}

function isGameOver(){
	var state = getBoardState(),
	matches = ['XXX', 'OOO'];
	
	rows = [
			state.a0 + state.a1 + state.a2,
            state.b0 + state.b1 + state.b2,
            state.c0 + state.c1 + state.c2,
            state.a0 + state.b1 + state.c2,
            state.a2 + state.b1 + state.c0,
            state.a0 + state.b0 + state.c0,
            state.a1 + state.b1 + state.c1,
            state.a2 + state.b2 + state.c2
			];
	
	for(var i=0; i<rows.length; i++){
		if(rows[i] === matches[0] || rows[i] === matches[1]){
			return true;
		}
	}
}

function isGameDraw(){
	var s = getBoardState();
	if( s.a0 ===' ' || s.a1 === ' ' || s.a2 === ' ' ||
		s.b0 ===' ' || s.b1 === ' ' || s.b2 === ' ' ||
		s.c0 ===' ' || s.c1 === ' ' || s.c2 === ' ' )
		return false;
	return true;	
}

//Change Turn message
function TurnMessage(){
	if(!myTurn){
		$('#turn').text('Your friend\'s turn..');
		$('.board button').attr('disabled', true);
	}
	else{
		$('#turn').text('Your turn..');
		$('.board button').removeAttr('disabled');
	}
}

function makeMove (e){
	e.preventDefault();
	
	if(!myTurn){
		return;
	}
	
	if($(this).text().length){
		return;
	}
	
	socket.emit('make.move', {
		symbol: symbol,
		position: $(this).attr('id')
	});
}

// After player makes move
socket.on('move.made', function (data) {
	
    $('#' + data.position).text(data.symbol);
    myTurn = (data.symbol !== symbol);
	
	if(isGameDraw()){
		$('#turn').text('Game Over.  It was a draw!');
		$('.board button').attr('disabled', true);
	}
	else if (!isGameOver()) {
		TurnMessage();
    }
	else {
        if (myTurn) {
            $('#turn').text('Game over. You lost.');
        } 
		else {
            $('#turn').text('Game over. You won!');
        }
        $('.board button').attr('disabled', true);
    }
});

// Set up the initial state when the game begins
socket.on('game.begin', function (data) {

	// The server will asign X or O to the player
	symbol = data.symbol;

	// Give X the first turn
	myTurn = (symbol === 'X');
    TurnMessage();
});

// Disable the board if the opponent leaves
socket.on('opponent.left', function () {
    $('#turn').text('Your opponent left the game.');
    $('.board button').attr('disabled', true);
});

$(function () {
    $('.board button').attr('disabled', true);
    $('.board button').on('click', makeMove); //---------********
});

			
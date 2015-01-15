//home.js	
var socket;
$(document).ready( function(){
	socket = io.connect("localhost", {port: 8000, 
				transports: ["websocket"]});

	setEventHandlers();
});

function setEventHandlers(){ 
	$('#start').click( function(){
			var username = $( '#username' ).val();
			var password = $( '#password' ).val();
			
			socket.emit( "find in database", {
				username: username,
				password: password,
			});	
	});

	socket.on( "database responce", onDatabaseResponce );	
}

function onDatabaseResponce( data ){
	var message;
	if ( data.success == true )
		 window.location.href = 'game.html';	
	
	else{
		message = "error";
		alert(message);
	}
	
}

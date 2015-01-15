var passportSocketIO 	= require( 'passport.socketio' );

module.exports = function ( io, cookie, session ){
	io.use( passportSocketIO.authorize({
		cookieParser: cookie,
		key: 'aladin_1_*&',
		secret: 'menhabbawadabbayaomme',
		store: session,
		success: onAuthorizeSuccess,
		failur: onAuthorizeFail,
	}));

	function onAuthorizeSuccess( data, accept ){	
		console.log( 'succesful connection to socket.io' );
		accept(); //accept the connection
	}  

	function onAuthorizeFail( data, message, error, accept ){
		if( err )
			accept( new Error( message ) );	
	}
	
	
	//load the game
	require( '../app/game/game.js' )( io );
	require( '../app/game/player.js' );
}

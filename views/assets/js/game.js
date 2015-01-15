// local game.js
//game variables
var	canvas,
	ctx,
	localPlayer,
	remotePlayers,
	socket,
	score;

//game initialisation
function init(){
	//canvas and rendering context
	canvas = document.getElementById( "theCanvas" );
	ctx = canvas.getContext( "2d" );

 	// size of canvas
	canvas.width = 500;
	canvas.height = 500;

	// Initialise keyboard controls
	keys = new Keys();

	//initialise the trap
	trap = new trap( canvas.width/2, canvas.height/2 );
		
	//calculate a random start position for the local player
	do{
		var	startX = Math.round(Math.random()*(canvas.width-5)),
			startY = Math.round(Math.random()*(canvas.height-5)); 	
	}while( getDistancePoints( startX, startY, trap.getX(), trap.getY() ) < 80 );

	//initialize the local player
	localPlayer = new player( startX, startY, 1 );		
 		
	remotePlayers = [];
	
	socket = io.connect( "localhost", { port: 8000, 
				transports: [ "websocket" ]} );
		
	//listening events
	setEventHandlers(); 
}

//game event handlers
var setEventHandlers = function(){
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);
	
	socket.on( "connect"		, onSocketConnected );	
	socket.on( "new player"		, onNewPlayer );
	socket.on( "return local id", onReturnLocalID );
	socket.on( "move player"	, onMovePlayer );
	socket.on( "remove player"	, onRemovePlayer );
	socket.on( "getting pushed"	, onGettingPushed );
	socket.on( "Server To Alpha", onServerToAlpha );
	socket.on( "changing score"	, onChangingScore );	
}

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
}

function onSocketConnected(){	
	console.log( "connected to the server" );		
	socket.emit( "new player", { 
		xPosition: localPlayer.getXPosition(), 
		yPosition: localPlayer.getYPosition() 
	} );
}

function onReturnLocalID( data ){
	localPlayer.id = data.id ;
	console.log( data.id );	
}

function onNewPlayer( data ){
	var newPlayer 	= new player( data.xPosition, data.yPosition, 2 );
	newPlayer.id 	= data.id;
	remotePlayers.push( newPlayer );	
}

function onMovePlayer( data ){
	var movePlayer;		
	movePlayer = getPlayerById( data.id );

	if( !movePlayer ){
		console.log( "player not found: " + data.id );
	}	
	else{		
		movePlayer.setXPosition( data.x );
		movePlayer.setYPosition( data.y );	
	}
}

function onChangingScore( data ){
	score = data.score;
	$( '#popUpWindow' ).css( 'display', 'block' );	
	$( '#score span' ).replaceWith( score );	
}

function onRemovePlayer( data ){
	var removePlayer = getPlayerById( data.id );

	if( !removePlayer ){
		console.log( "player not found" + data.id);
		return;
	}

	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
}

function onGettingPushed( data ){
	if( data.betaId == localPlayer.id ){	
		var alpha = getPlayerById( data.alphaId );
		var lineEquation = collisionLineEquation( alpha, localPlayer );
		var CPosition = collisionCPosition( alpha, localPlayer, lineEquation.a, lineEquation.b, 120, (canvas.width - 30), (canvas.height - 30));
			
		localPlayer.nextPosition.x 	= CPosition.xc;
		localPlayer.nextPosition.y 	= CPosition.yc;
		localPlayer.nextPosition.a 	= lineEquation.a;
		localPlayer.nextPosition.b 	= lineEquation.b;
		localPlayer.hitter 			= alpha;
		var counter 				= 0;
		collisionUpdate( counter );	
	}
} 

function onServerToAlpha( data ){
	if( localPlayer.id == data.id ){
		localPlayer.hold = data.hold;
		
		if( data.kill == true ){		
			socket.emit( "increase score" );
			var X = trap.getX();
			var Y = trap.getY();
			remotePlayers[0].kill( ctx, X, Y);
		}
	}
}

function animate(){	
	update();			
	draw();
	if( remotePlayers[0] )
	if( getDistancePoints( localPlayer.getXPosition(), localPlayer.getYPosition(), remotePlayers[0].getXPosition(), remotePlayers[0].getYPosition() ) < 59 ){
		var lineEquation = collisionLineEquation( remotePlayers[0], localPlayer );
		var CPosition = collisionCPosition( remotePlayers[0], localPlayer, lineEquation.a, lineEquation.b, 60, (canvas.width - 30), (canvas.height - 30));
		
		localPlayer.setXPosition( CPosition.xc );
		localPlayer.setYPosition( CPosition.yc );
		
		socket.emit( "move player", {
			id			: localPlayer.id,
			xPosition	: CPosition.xc,
			yPosition	: CPosition.yc,
		});

	}
	// Request a new animation frame using Paul Irish's shim
	if( localPlayer )mainLoop = window.requestAnimFrame(animate);	
}

function update(){	
 	if( localPlayer.update( canvas, keys ) == true )
	{	
		localPlayer.moving = true;
		checkKill();	
		socket.emit( "move player", {
			id 			: localPlayer.id,
			xPosition	: localPlayer.getXPosition(), 
			yPosition	: localPlayer.getYPosition(),
		});
	
		checkCollision();	
		
	}else localPlayer.moving = false;
}

function collisionUpdate( counter ){
	var	nextX 	= localPlayer.nextPosition.x,
		nextY 	= localPlayer.nextPosition.y,
		X 		= localPlayer.getXPosition(),
		Y 		= localPlayer.getYPosition(),
		A 		= localPlayer.nextPosition.a,
		B 		= localPlayer.nextPosition.b;
	if( nextX && nextY ){		
		//reset
		if( getDistancePoints( X, Y, nextX, nextY ) < 4 ){
			localPlayer.nextPosition.x = null;
			localPlayer.nextPosition.y = null;	
			socket.emit( "end of lunch", {
				alphaId	: localPlayer.hitter.id,
				kill	: false,
				hold	: false,
			});	
			clearInterval( pushed );
		}

		else{
			checkKill();
			if( Math.abs( nextX - X ) > Math.abs( nextY - Y ) ){
			//horizontal
				if( nextX > X ) X += 3;
					
				else 			X -= 3;
					
				Y = A * X + B; 
			}else{
			//vertical
				if( nextY > Y ) Y += 3;
				else 			Y -= 3;
				
				X = ( Y - B ) / A;			
			}
			counter ++;
			localPlayer.setXPosition( X );
			localPlayer.setYPosition( Y );
			
			if( counter >= 4 ){		
				socket.emit( "move player", {
					id			: localPlayer.id,
					xPosition	: X,
					yPosition	: Y,
				});
				counter = 0;
			}
			var pushed =  setInterval( collisionUpdate( counter ), 100 );
		
		}	
	}
}

function checkCollision(){
	var theDistance = 80;
	var playerB;
	
	if( remotePlayers.length > 0 ){
		for( var i = 0; i < remotePlayers.length; i++ ){
			var distance = getDistanceObject( localPlayer, remotePlayers[i] );	
			if( distance < theDistance ){
				theDistance = distance;
				playerB = remotePlayers[i];
			}
		}
	}

	if( playerB ){
		socket.emit( "check collision", { 
			playerB_Id: playerB.id,
		});
	}
}

function checkKill(){
	var X	= trap.getX(),
		Y   = trap.getY();
		
	if( getDistancePoints( localPlayer.getXPosition(), localPlayer.getYPosition(), X, Y ) < 60  ){
		if( localPlayer.nextPosition.x != null ){
			localPlayer.nextPosition.x = null;
			localPlayer.nextPosition.y = null;
			localPlayer.kill( ctx, X, Y );
			 
			if( localPlayer.hitter )
			socket.emit( "end of lunch", {
				alphaId	: localPlayer.hitter.id,
				kill	: true,
				hold	: true,
			});
			else 
			socket.emit( "end of lunch", {
				kill: true,
				hold: true,
			});
		
			var b = trap.getY() - localPlayer.getYPosition();
			var c = 60;		
			
			//get angle
			var SinAngle 				= b / c;
			var angleRadient 			= Math.asin( SinAngle );
			var angle					= -angleRadient*( 180/Math.PI );
			
			if( localPlayer.getXPosition() < trap.getX() )
				 angle = angle + 180 - angle * 2;
			
			localPlayer.rotationAngle 	= angle;	
		}
	}
}

function draw(){
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//draw the trap
	trap.draw( ctx );

	// Draw the local player
	if( localPlayer.draw(ctx) == false){
		setTimeout(function(){
			cancelRequestAnimFrame(mainLoop);                
		}, 1*1000);	
			
	}
	//draw remote players
	for( var i = 0; i < remotePlayers.length; i++ )
		remotePlayers[i].draw( ctx );
}

function collisionLineEquation( playerA, playerB ){
	var	a,b,
		xa = playerA.getXPosition(),
		ya = playerA.getYPosition(),
		xb = playerB.getXPosition(),
		yb = playerB.getYPosition();

	b = ( ( yb * xa ) - ( ya * xb ) ) / ( -xb + xa );
	a = ( ya - b ) / xa;

	return{
		b: b,
		a: a,
	};		
}

function collisionCPosition( playerA, playerB, a, b, distance, maxWidth, maxHeight){
	var	xa = playerA.getXPosition(),
		ya = playerA.getYPosition(),
		xb = playerB.getXPosition(),
		yb = playerB.getYPosition(),
		deltaA, deltaB, deltaC,
		xc,
		yc;

	deltaA = 1 + ( square( a ) );
	deltaB = ( -2 * xa ) + ( 2 * a * b ) - ( 2 * a * ya );
	deltaC = (square(xa)) + (square(ya)) + (square(b)) - (2 * b * ya) - square( distance );	
	
	if( xb > xa )
		var x = (-deltaB + Math.sqrt( (square( deltaB )) - (4 * deltaA * deltaC) ))/( 2 * deltaA );
	else
		var x = (-deltaB - Math.sqrt( (square( deltaB )) - (4 * deltaA * deltaC) ))/( 2 * deltaA );

	if( x > 0 && x < maxWidth ) xc = x;
	else if( x < 0 ) xc = 1;
	else if( x > maxWidth ) xc = ( maxWidth + 1 );

	var y = a * xc + b;
	if( y > 0 && y < maxHeight ) yc = y;
	else if( y < 0 ) yc = 1;
	else if( y > maxHeight ) yc = ( maxHeight + 1 );		

	return{
		xc: xc,
		yc: yc,
	};
}

function getDistanceObject( objectA, objectB ){
	//c = sqrt( (xa - xb)(xa - xb) + (ya - yb)(ya - yb) );
	return Math.sqrt( square( objectA.getXPosition() - objectB.getXPosition() ) + square( objectA.getYPosition() - objectB.getYPosition() ) );
}

function getDistancePoints( xa, ya, xb, yb ){
	return Math.sqrt( square( xa - xb ) + square( ya - yb ) );
}

function square( x ){
	return x * x;
}

function getPlayerById( id ){
	var i;
	for( i = 0; i < remotePlayers.length; i++ ){
		if( remotePlayers[i].id == id )
			return remotePlayers[i];
	}

	return false;
}


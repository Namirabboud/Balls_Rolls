// app/game.js  <Server Side>
player 		= require( './player' ).player;
var User 	= require( '../models/user' );

module.exports = function( io ){
	var players;	
	
	function init(){
		players = [];	
		setEventHandlers();
	}

	var setEventHandlers = function(){
		io.on( 'connection', function( socket ){ 
			console.log( "player has connected: " + socket.id );	
			//var user 	= socket.client.request.user;
			socket.on( "disconnect"		, onClientDisconnect );
			socket.on( "new player"		, onNewPlayer );
			socket.on( "move player"	, onMovePlayer );
			socket.on( "check collision", onCheckCollision );
			socket.on( "end of lunch"	, onEndOfLunch );		
			socket.on( "increase score"	, onIncreaseScore );		
		});
	};	

	function onClientDisconnect(){
		console.log( "player has disconnected: " + this.id );
	
		var removePlayer = getPlayerById( this.id );
	
		if( !removePlayer ){
			console.log( "player not found: " + this.id );
			return;
		}

		//at the index of removePlayer remove 1 player
		players.splice( players.indexOf( removePlayer ),1 );

		//broadcast to all player the id of the removed player
		this.broadcast.emit( "remove player", { id: this.id });	
	}
	
	function getPlayerById( id ){
		var i;
		for( i = 0; i < players.length; i++ ){
			if( players[i].id == id )
				return players[i];
		}

		return false;
	}

	function onEndOfLunch( data ){
		var currentScore;	
		if( data.kill != true )
		this.broadcast.emit( "Server To Alpha", {
			id	: data.alphaId,
			hold: data.hold,
			kill: false, 
		});

		else{
			var user	= this.client.request.user;
			var email	= user.local.email;
			currentScore = user.local.score - 5;
			//decrease the score of the killed user by 5
			User.findOne( { 'local.email': email }, function( err, usr ){ 
				var srv = this;
				if( err ) return next( err ) ;
 				usr.local.score -= 5;
				usr.save( function( err ){
					if( err )return next( err );	
				});	
			});
		
			this.emit( "changing score", {
					score: currentScore,
			});
			
			this.broadcast.emit( "Server To Alpha", {
				id	: data.alphaId,
				hold: data.hold,
				kill: true, 
			});
			
		}
	}

	function onIncreaseScore( data ){
		var user 			= this.client.request.user;
		var email			= user.local.email;
		var currentScore 	= user.local.score + 5;
		User.update( { 'local.email': email }, { $inc: { 'local.score': 5 } }, function( err ){ 
			if( err ) return;
	
			console.log( "success" );
		});
		
		this.emit( "changing score", { 
			score: currentScore,
		});
	}

	function onNewPlayer( data ){
		var newPlayer = new player( data.xPosition, data.yPosition );
		newPlayer.id = this.id;	

		//return the id of the local player to client
		this.emit( "return local id", { 
			id: newPlayer.id,
		}); 

		//send the player to other players
		this.broadcast.emit( "new player", { 
			id: newPlayer.id, 
			xPosition: newPlayer.getXPosition(), 
			yPosition: newPlayer.getYPosition()
		});

		//send existing players to the new player
		var i, existingPlayer;
		
		for (i = 0; i < players.length; i++){
			if( players[i].id != newPlayer.id )existingPlayer = players[i];
			if( existingPlayer )
			this.emit("new player", { 
				id: existingPlayer.id, 
				xPosition: existingPlayer.getXPosition(), 
				yPosition: existingPlayer.getYPosition()
			});
		};

		players.push( newPlayer );	
	}

	function onMovePlayer( data ){		
		var movePlayer = getPlayerById( data.id );			
		if( movePlayer ){	
			movePlayer.setXPosition( data.xPosition );
			movePlayer.setYPosition( data.yPosition );

			this.broadcast.emit( "move player", {
				id: movePlayer.id,
				x: movePlayer.getXPosition(),
				y: movePlayer.getYPosition(),	
			});
		}	
	}

	function onCheckCollision( data ){			
		var playerA = getPlayerById( this.id ),
			playerB = getPlayerById( data.playerB_Id );
	
		//get the real distance on server side it might look different then 
		//the distance on client side
		var distance = getDistanceObject( playerA, playerB );
				
		storePositionBeforeCollision( playerA, playerB, distance, this );
		
		var speedA = getPlayerSpeed( playerA );
		var speedB = getPlayerSpeed( playerB );			
		
		if( speedA ){	
			if( ATowardsB( playerA, playerB ) == true ){	
				if( speedA >= speedB || !speedB ){
				//player i has more force then player j		
					CollisionBetweenAlphaAndBeta( playerA, playerB, this );	
				}
			} 		
		}
		
	}	

	function ATowardsB( playerA, playerB ){
		var ALineEquation = getLineEquation( playerA.positionArchive[0], playerA.positionArchive[1],playerA.positionArchive[2], playerA.positionArchive[3] );
		var ANextPosition = getCPosition( playerA.positionArchive[0], playerA.positionArchive[1], playerA.positionArchive[2], playerA.positionArchive[3], ALineEquation.a, ALineEquation.b, ALineEquation.vertical, 60 );
		var distance = getDistancePoints( ANextPosition.xc, ANextPosition.yc, playerB.getXPosition(), playerB.getYPosition() );
		if( distance < 60 )return true;
		else return false;
	}

	function CollisionBetweenAlphaAndBeta( alpha, beta, srv ){
		var srv = srv;	
		//send to beta to be lunched
		//the true input is the lunch parameter that inform beta to be lunched
		//if false then only keep the players from entering eachothers	
		srv.broadcast.emit( "getting pushed", {
			betaId	: beta.id,
			alphaId	: alpha.id,
		});
		
		//send to alpha to stop moving while beta is being throwed
		srv.emit( "Server To Alpha",{
			id	: alpha.id,
			hold: true,
		});	
				
	}
	
	//store position of playerA and playerB at a cetain distance between the two nodes
	function storePositionBeforeCollision( playerA, playerB, distance, srv ){
		if( distance < 65  &&  distance > 60 ){
			playerA.positionArchive.length = 0;	
			playerA.positionArchive.push( playerA.getXPosition() );
			playerA.positionArchive.push( playerA.getYPosition() );
		
		}	

		else if( distance <= 60 ){	
			//collision
			if( playerA.positionArchive.length == 2 ){	
				playerA.positionArchive.push( playerA.getXPosition() );
				playerA.positionArchive.push( playerA.getYPosition() );
			}
			else{
				playerA.positionArchive.length = 0;
					
			}
		}

		else if( distance > 65 ){
			playerA.positionArchive.length = 0;	
		}
	}

	function getPlayerSpeed( player ){
		if( player.positionArchive.length == 4 ){
			var speed = getDistancePoints( 	player.positionArchive[0], player.positionArchive[1],player.positionArchive[2],player.positionArchive[3] );
			return speed;
		}else return ;
			
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

	function getLineEquation( xa, ya, xb, yb ){
		var a, b, vertical;

		if( xb != xa ){
			a = ( yb - ya )/( xb - xa );
			b = ya - ( a * xa ); 	
			vertical = false;
		}
		
		else vertical = true;

		return{
			b: b,
			a: a,
			vertical: vertical,
		};
	}

	function getCPosition( xa, ya, xb, yb, a, b, vertical, distance ){
		var 	xc, yc;
			if( vertical == false ){
				var deltaA, deltaB, deltaC;
				deltaA = 1 + ( square( a ) );
				deltaB = ( -2 * xa ) + ( 2 * a * b ) - ( 2 * a * ya );
				deltaC = (square(xa)) + (square(ya)) + (square(b)) - (2 * b * ya) - square( distance );	
				
				if( xb > xa )
					xc = (-deltaB + Math.sqrt( (square( deltaB )) - (4 * deltaA * deltaC) ))/( 2 * deltaA );

				else
					xc = (-deltaB - Math.sqrt( (square( deltaB )) - (4 * deltaA * deltaC) ))/( 2 * deltaA );

				yc = a * xc + b;	
			}
		
			else if ( vertical == true ){
				xc = xb;
				if( yb > ya )
					yc = ya + 60;
				else
					yc = ya - 60;
			}
			return{
				xc: xc,
				yc: yc,
			};
	}

	init();	

}

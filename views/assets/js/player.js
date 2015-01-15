//player class
var player = function( x, y, shape ){
	var	xPosition = x,
		yPosition = y,
		Shape = shape,
		image = new Image(),
		id,
		i = 0,	
		moving = false,	
		hold = false,
		hitter,
		steps = 0,
		speed,
		rotationAngle = 0,
		longThrow;	
	
	var nextPosition = {
		x: 0,
		y: 0,
		a: null,
		b: null
	};
		
	image.src = "assets/images/images.png";
	
	var getXPosition = function(){
		return xPosition;
	};

	var getYPosition = function(){
		return yPosition;
	};

	var setXPosition = function( newX ){
		if( newX < ( canvas.width - 30 ) && newX > 30  )xPosition = newX;
	};	

	var setYPosition = function( newY ){
		if( newY < ( canvas.height - 30 ) && newY > 30 )yPosition = newY;		
	};		

	function update( canvas, keys ){	
		var removeNextPosition = false;
		if( keys.boost ) speed = 2;
		else speed = 0.5;
		
		if( this.hold == false ){
			
			// Up key takes priority over down
			if ( keys.up && yPosition > 30 ){
				yPosition -= speed;
				steps ++;
			}
			else if ( keys.down && yPosition < ( canvas.height - 30 ) ){
				yPosition += speed;
				steps ++;
			}
			// Left key takes priority over right
			if ( keys.left && xPosition > 30  ){
				xPosition -= speed;
				steps ++;
			}
			else if (keys.right && xPosition < ( canvas.width - 30 )){ 
				xPosition += speed;
				steps ++;
			}
			
			if( steps >= 4 ){	
				steps = 0;	
				return true;
			}
		}
				
	};

	
	var draw = function( ctx ){	
		i++;
		ctx.beginPath();
		ctx.translate( xPosition, yPosition );
		if( shape == "1" ){
			ctx.drawImage( image, 0, 0, 150, 140, -35, -35, 70, 70 );
			//draw effects
			if( i >= 20 ){
				ctx.drawImage( image, 0, 160, 420, 340,  -85, -85, 200, 200 );	
				i = 0;		
			}
		}

		if( shape == 2 ){
			ctx.drawImage( image, 200, 0, 140, 140, -35, -35, 70, 70 );
			if( i >= 20 )i = 0;
		}
		
		ctx.translate( -xPosition, -yPosition );				
	};

	var kill = function( ctx, centerX, centerY ){	
		this.draw = function( ctx ){	
			this.gettinHit = true;
			ctx.beginPath();	
			ctx.translate( centerX, centerY );	
			ctx.rotate( this.rotationAngle*Math.PI/180 );
			if( i < -35 ){
				ctx.drawImage( image, 360, 0, 505, 145 , -72, -72, 505, 145 );
				ctx.rotate( -this.rotationAngle*Math.PI/180 );
				ctx.translate( -centerX, -centerY );
				return false;
			}
		 	else{
				if( shape == 1 )ctx.drawImage( image, 0, 0, 150, 140, i, i, 70, 70);
				else ctx.drawImage( image, 200, 0, 140, 140, i, i, 70, 70 );	
			}	
			ctx.rotate( -this.rotationAngle*Math.PI/180 );
			ctx.translate( -centerX, -centerY );
			this.rotationAngle++;
			i -= 0.2 ;
			
		};
	}

function getDistancePoints( xa, ya, xb, yb ){
	return Math.sqrt( square( xa - xb ) + square( ya - yb ) );
}
	return{
		getXPosition	: getXPosition,
		getYPosition	: getYPosition,
		setXPosition	: setXPosition,
		setYPosition	: setYPosition,	
		moving			: moving,
		draw			: draw,
		id				: id,
		nextPosition	: nextPosition,
		update			: update,
		hold			: hold,
		hitter			: hitter,
		kill			: kill,
		rotationAngle	: rotationAngle,
		i				: i,
		longThrow		: longThrow,
	};
}

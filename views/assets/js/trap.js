//class trap
var trap = function( x, y ){
	var 	X = x,
	 		Y = y,
			rotationAngle = 1;
	var 	image = new Image();
	image.src = "assets/images/trap.png";	

	var draw = function( ctx ){
		ctx.beginPath();
		ctx.translate( X, Y );
		ctx.rotate( -rotationAngle*Math.PI/180 );
		ctx.drawImage( image, -50, -50, 100, 100 );
		ctx.rotate( rotationAngle*Math.PI/180 );
		ctx.translate( -X, -Y );
		rotationAngle ++;
	};

	var getX = function(){
		return X;
	}

	var getY = function(){
		return Y;
	}

	return{
		draw: draw,
		getX: getX,
		getY: getY,				
	};
}

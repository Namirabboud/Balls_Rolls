//player class on server
var player = function(startX, startY ){
	var xPosition 	= startX,
	yPosition 		= startY,	
	id,
	positionArchive = [];		

	var getXPosition = function(){
		return xPosition;
	};
	
	var getYPosition = function(){
		return yPosition;
	};

	var setXPosition = function( newX ){
		xPosition = newX;
	};

	var setYPosition = function( newY ){
		yPosition = newY;
	};

	return{
		id				: id,
		getXPosition	: getXPosition,
		getYPosition	: getYPosition,
		setXPosition	: setXPosition,
		setYPosition	: setYPosition,	
		positionArchive	: positionArchive,	
	}
}

//in order to make it as module
exports.player = player;


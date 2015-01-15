/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false,
		boost = false;
		
	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 37: // Left
				that.left = true;
				break;
			case 65:// letter A
				that.left = true;
				break;
			case 38: // Up
				that.up = true;
				break;
			case 87: // letter W
				that.up = true;
				break;
			case 100: // Right
				that.right = true; // Will take priority over the left key
				break;
			case 68: // letter D
				that.right = true; // Will take priority over the left key
				break;
			case 40: // Down
				that.down = true;
				break;
			case 83: // letter S
				that.down = true;
				break;
			case 32: //space
				that.boost = true;
				break;
		};
	};
	
	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 37: // Left
				that.left = false;
				break;
			case 65:// letter A
				that.left = false;
				break;
			case 38: // Up
				that.up = false;
				break;
			case 87: // letter W
				that.up = false;
				break;
			case 100: // Right
				that.right = false;
				break;
			case 68: // letter D
				that.right = false; // Will take priority over the left key
				break;
			case 40: // Down
				that.down = false;
				break;
			case 83: // letter S
				that.down = false;
				break;
			case 32: //boost
				that.boost = false;
		};
	};

	return {
		up: up,
		left: left,
		right: right,
		down: down,
		boost: boost,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};

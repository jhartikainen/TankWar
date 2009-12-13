/**
 * Geometry utilities
 */
var Geom = {
	/**
	 * Plot a line between two points, returning list of the points in the line.
	 *
	 * Implements optimized Bresenham's algorithm.
	 * 
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @return {Array}
	 */
	plotLine: function(x1, y1, x2, y2) {
		var steep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
		if(steep) {
			//Swap X and Y values
			var newX = y1;
			y1 = x1;
			x1 = newX;

			//Swap X2 and Y2 values
			newX = y2;
			y2 = x2;
			x2 = newX;
		}

		if(x1 > x2) {
			//Swap X and X2
			var newX = x2;
			x2 = x1;
			x1 = newX;

			//Swap Y and Y2
			var newY = y2;
			y2 = y1;
			y1 = newY;
		}

		var deltaX = x2 - x1;
		var deltaY = Math.abs(y2 - y1);
		var error = deltaX / 2;
		var yStep;
		var y = y1;

		if(y1 < y2) {
			yStep = 1;
		}
		else {
			yStep = -1;
		}

		var points = [];
		for(var x = x1; x < x2; x++) {
			if(steep) {
				points.push({
					x: y,
					y: x
				});
			}
			else {
				points.push({
					x: x,
					y: y
				});
			}

			error -= deltaY;
			if(error < 0) {
				y += yStep;
				error += deltaX;
			}
		}

		return points;
	}
};
/**
 * Geometry utilities
 */
var Geom = {
	/**
	 * Calculate angle of a line between two points
	 * @param {Point} startPoint
	 * @param {Point} endPoint
	 * @return {Number} Angle in radians
	 */
	lineAngle: function(startPoint, endPoint) {
		return Math.atan2(-(startPoint.y - endPoint.y), -(startPoint.x - endPoint.x));
	},
	
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
	},

	/**
	 * Plot a filled circle using modified Midpoint Circle Algorithm
	 *
	 * Stolen from wikipedia
	 *
	 * @param {Point} point
	 * @param {Number} radius
	 * @return {Array} of {Point}s
	 */
	plotFilledCircle: function(point, radius) {
		var points = [];

		var x0 = point.x,
			y0 = point.y;
		
		var f = 1 - radius;
		var ddF_x = 1;
		var ddF_y = -2 * radius;
		var x = 0;
		var y = radius;

		points = points.concat(
			Geom.plotLine(x0, y0 + radius, x0, y0 - radius),
			Geom.plotLine(x0 + radius, y0, x0 - radius, y0)
		);

		while(x < y) {
			// ddF_x == 2 * x + 1;
			// ddF_y == -2 * y;
			// f == x*x + y*y - radius*radius + 2*x - y + 1;
			if(f >= 0) {
				y--;
				ddF_y += 2;
				f += ddF_y;
			}
			x++;
			ddF_x += 2;
			f += ddF_x;
			points = points.concat(
				Geom.plotLine(x0 + x, y0 + y, x0 - x, y0 + y),
				Geom.plotLine(x0 + x, y0 - y, x0 - x, y0 - y),
				Geom.plotLine(x0 + y, y0 + x, x0 - y, y0 + x),
				Geom.plotLine(x0 + y, y0 - x, x0 - y, y0 - x)
			);
		}

		return points;
	}
};
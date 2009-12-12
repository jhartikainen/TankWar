/**
 * Random terrain generator
 */
var TerrainGenerator = function() {
};

TerrainGenerator.prototype = {
	/**
	 * Creates random terrain
	 *
	 * Base height determines the standard height line of the terrain.
	 * Max and min height determine how much up and down the terrain's height can deviate from base height.
	 * Height points determine how complex the terrain is. Each point is placed within even distance from other points,
	 * and their Y position is randomized between values in base height and min/max.
	 * 
	 * @param {Size} size
	 * @param {Number} baseHeight
	 * @param {Number} heightPoints
	 * @param {Number} maxHeight
	 * @param {Number} minHeight
	 * @return {Terrain}
	 */
	generate: function(size, baseHeight, heightPoints, maxHeight, minHeight) {
		baseHeight = (baseHeight) ? Number(baseHeight) : 300;
		heightPoints = (heightPoints) ? Number(heightPoints) : 14;

		maxHeight = (maxHeight) ? Number(maxHeight) : 100;
		minHeight = (minHeight) ? Number(minHeight) : -100;

		var points = [];

		points.push(new Point(size.getWidth(), getAHeight()));

		var step = Math.round(size.getWidth() / heightPoints);
		var cw = size.getWidth();
		for(var i = 0; i < heightPoints; i++) {
			cw -= step;
			points.push(new Point(cw, getAHeight()));
		}

		points.push(new Point(0, getAHeight()));

		points = points.reverse();
		var mask = new Array(size.getHeight());
		for(var pointIdx = 0, pointMax = points.length - 1; pointIdx < pointMax; pointIdx++) {			
			var line = this._plotLine(points[pointIdx].x, points[pointIdx].y, points[pointIdx + 1].x + 1, points[pointIdx + 1].y);
			for(var lineIdx = 0; lineIdx < line.length; lineIdx++) {
				this._fillMask(mask, line[lineIdx]);
			}
		}

		return new Terrain(points, mask);

		function getAHeight()
		{
			var h = baseHeight;

			var r = (Math.round(Math.random()*(maxHeight-minHeight)))+minHeight;

			return h - r;
		}
	},

	/**
	 * Fill mask array down from X/Y point
	 * @param {Array} mask
	 * @param {Point} point
	 */
	_fillMask: function(mask, point) {
		for(var y = point.y; y < mask.length; y++) {
			if(!mask[y]) {
				mask[y] = [];
			}
			mask[y][point.x] = 1;
		}		
	},

	/**
	 * Implements optimized Bresenham's algorithm to plot a rasterized line between two points
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @return {Array} array of points { x, y }
	 */
	_plotLine: function(x1, y1, x2, y2) {
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
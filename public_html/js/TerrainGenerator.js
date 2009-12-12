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
		var mask = [];
		for(var y = 0; y < size.getHeight(); y++) {
			mask[y] = [];
			for(var x = 0; x < size.getWidth(); x++) {
				mask[y][x] = Terrain.MASK_EMPTY;
			}
		}

		for(var pointIdx = 0, pointMax = points.length - 1; pointIdx < pointMax; pointIdx++) {			
			var line = Geom.plotLine(points[pointIdx].x, points[pointIdx].y, points[pointIdx + 1].x + 1, points[pointIdx + 1].y);
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
			mask[y][point.x] = Terrain.MASK_GROUND;
		}		
	}
};
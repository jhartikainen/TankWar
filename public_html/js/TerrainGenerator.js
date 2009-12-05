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
		var baseHeight = (baseHeight) ? Number(baseHeight) : 300;
		var heightPoints = (heightPoints) ? Number(heightPoints) : 14;

		var maxHeight = (maxHeight) ? Number(maxHeight) : 100;
		var minHeight = (minHeight) ? Number(minHeight) : -100;

		var points = new Array();

		points.push(new Point(0,0));
		points.push(new Point(size.getWidth(), 0));
		points.push(new Point(size.getWidth(), getAHeight()));

		var step = Math.round(size.getWidth() / heightPoints);
		var cw = size.getWidth();
		for(var i = 0; i < heightPoints; i++)
		{
			cw -= step;
			points.push(new Point(cw, getAHeight()));
		}


		points.push(new Point(0, getAHeight()));
		points.push(new Point(0,0));

		return new Terrain(points);

		function getAHeight()
		{
			var h = baseHeight;

			var r = (Math.round(Math.random()*(maxHeight-minHeight)))+minHeight;

			return h - r;
		}

	}
}
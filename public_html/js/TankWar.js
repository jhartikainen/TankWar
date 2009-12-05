/**
 * Game app controller
 */
var TankWar = function() {
};

TankWar.prototype = {
	/**
	 * Start application
	 */
	run: function() {
		var mapSize = new Size(1000, 400);
		var generator = new TerrainGenerator();
		var terrain = generator.generate(mapSize, 300, 14, 100, -100);

		var canvas = document.createElement('canvas');
		canvas.width = mapSize.getWidth();
		canvas.height = mapSize.getHeight();

		document.body.appendChild(canvas);
		var context = canvas.getContext('2d');

		terrain.render(context);
	}
};
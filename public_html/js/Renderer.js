/**
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Terrain} terrain
 */
var Renderer = function(context, terrain) {
	this._terrain = terrain;
};

Renderer.prototype = {
	clearRect: function(x, y, width, height) {
		var imageData = this._context.getImageData(x, y, width, height);
		this._terrain.renderRect(imageData, new Rect(x, y, width, height));
		return imageData;
	},

	/**
	 * @return {CanvasRenderingContext2D}
	 */
	getContext: function() {
		return this._context;
	}
};
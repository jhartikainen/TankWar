var Cloud = function(image) {
	this._image = image;
	this.position = new Vector2(0, 0);
	this.velocity = new Vector2(10, 0);
};

Cloud.prototype = {
	weight: 0,

	getRect: function() {
		return new Rect(this.position.x, this.position.y, this._image.width, this._image.height);
	},

	work: function(timeDelta, simulation) {
		this.velocity.x = 10;
	},

	collision: function(terrain) {
		//no effect
	},

	/**
	 * Render tank
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(context) {
		context.drawImage(this._image, this.position.x, this.position.y);
	}
};
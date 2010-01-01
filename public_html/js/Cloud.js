var Cloud = function(image) {
	this._image = image;
	this._width = image.width;
	this._height = image.height;
	this._x = 0;
	this.position = new Vector2(0, 0);
	this.velocity = new Vector2(10, 0);
};

Cloud.prototype = {
	weight: 0,

	getRect: function() {
		return new Rect(this.position.x, this.position.y, this._width, this._height);
	},

	work: function(timeDelta, simulation) {
		this.velocity.x = simulation.getWind();

		//We don't actually move, just move the graphic
		this._x += this.position.x;
		if(this._x >= this._width) {
			this._x = 0;
		}

		this.position.x = 0;
	},

	collision: function(terrain) {
		//no effect
	},

	/**
	 * Render tank
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(context) {
		var x = ~~this._x;
		context.drawImage(this._image, x, this.position.y);
		if(x > 0) {
			var sliceX = this._width - x;
			context.drawImage(this._image, sliceX, 0, x, this._height, 0, this.position.y, x, this._height);
		}
	}
};
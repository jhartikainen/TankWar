var Cloud = function(image) {
	this._image = image;
	this.position = new Vector2(0, 0);
	this.velocity = new Vector2(10, 0);
	this._el = document.createElement('div');
	this._el.style.position = 'absolute';
	this._el.style.backgroundImage = 'url(' + image.src + ')';
	this._el.style.width = image.width + 'px';
	this._el.style.height = image.height + 'px';
};

Cloud.prototype = {
	weight: 0,

	getRect: function() {
		return new Rect(0, 0, 1, 1);
	},

	work: function(timeDelta, simulation) {
		//this.velocity.x = 10;
	},

	collision: function(terrain) {
		//no effect
	},

	/**
	 * Render tank
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(context) {
		if(!this._el.parentNode) {
			context.insertBefore(this._el, context.firstChild);
		}

		this._el.style.left = (~~this.position.x) + 'px';
		this._el.style.top = (~~this.position.y) + 'px';
	}
};
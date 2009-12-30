/**
 * Rectangle
 * @param {Number} x
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 */
var Rect = function(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.right = x + width;
	this.bottom = y + height;
};

Rect.prototype = {
	/**
	 * Gets the intersecting area rectangle
	 *
	 * May return wrong stuff, or fail completely, if rects don't actually intersect!
	 * 
	 * @param {Rect} rect Intersecting rectangle
	 * @return {Rect} made up of the intersecting area.
	 */
	getIntersectionRect: function(rect) {
		var x = Math.max(this.x, rect.x),
		    y = Math.max(this.y, rect.y),
		    width = Math.min(this.right, rect.right) - x,
		    height = Math.min(this.bottom, rect.bottom) - y;

		return new Rect(x, y, width, height);
	},

	/**
	 * Does other rect intersect with this
	 * @param {Rect} rect
	 * @return {Boolean}
	 */
	intersects: function(rect) {
		if(rect.right < this.x || rect.x > this.right) {
			return false;
		}

		if(rect.bottom < this.y || rect.y > this.bottom) {
			return false;
		}

		return true;
	},

	/**
	 * Does this rect contain other rect
	 * @param {Rect} rect
	 */
	containsRect: function(rect) {
		if(rect.right > this.right) {
			//console.log('FALSE');
			return false;
		}

		if(rect.x < this.x) {
			//console.log('FALSE');
			return false;
		}

		if(rect.bottom > this.bottom) {
			//console.log('FALSE');
			return false;
		}

		if(rect.y < this.y) {
			//console.log('FALSE');
			return false;
		}

		return true;
	}
};
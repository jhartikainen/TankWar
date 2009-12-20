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
};

Rect.prototype = {
	/**
	 * Does this rect contain other rect
	 * @param {Rect} rect
	 */
	containsRect: function(rect) {
		if(rect.x + rect.width > this.x + this.width) {
			console.log('FALSE');
			return false;
		}

		if(rect.x < this.x) {
			console.log('FALSE');
			return false;
		}

		if(rect.y + rect.height > this.y + this.height) {
			console.log('FALSE');
			return false;
		}

		if(rect.y < this.y) {
			console.log('FALSE');
			return false;
		}

		return true;
	}
};
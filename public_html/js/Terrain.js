/**
 * Describes the game terrain
 * @param {Array} p points that make up the terrain
 * @param {Array} mask Pixel mask for collisions etc.
 */
var Terrain = function(p, mask) {
	this._points = p
	this._holes = [];
	this._mask = mask;

	this._clearColor = 'lightblue';

	//Added for customPolyCheck
	this.pointCount = this._points.length;
	this.xArray = new Array();
	this.yArray = new Array();

	for(var i = 0; i < this.pointCount; i++)
	{
		this.xArray.push(this._points[i].x);
		this.yArray.push(this._points[i].y);
	}
};

/**
 * Constant for empty area in mask
 * @type {Number}
 */
Terrain.MASK_EMPTY = 0;

/**
 * Constant for ground in the terrain mask
 * @type {Number}
 */
Terrain.MASK_GROUND = 1;

Terrain.prototype = {
	/**
	 * Render terrain
	 * @param {CanvasRenderingContext2D} imageData
	 */
	render: function(imageData) {
		/*for(var i = 0; i < imageData.data.length; i += 4) {
			imageData.data[i] = 0xFF;
			imageData.data[i + 1] = 0;
			imageData.data[i + 2] = 0xFF;
		}*/

		for(var y = 0; y < this._mask.length; y++) {
			var xs = this._mask[y];
			for(var x = 0; x < xs.length; x++) {
				var pt = ((imageData.width * y) + x) << 2;

				if(xs[x] === Terrain.MASK_EMPTY) {
					imageData.data[pt] = 0xFF;
					imageData.data[pt + 1] = 0x0;
					imageData.data[pt + 2] = 0x0;
				}
				else {
					imageData.data[pt] = 0xFF;
					imageData.data[pt + 1] = 0xFF;
					imageData.data[pt + 2] = 0xFF;
				}
			}
		}
	},

	/**
	 * Render a rectangle of the terrain
	 * @param {Object} imageData
	 * @param {Rect} rect
	 */
	renderRect: function(imageData, rect) {
		for(var y = rect.y, maxY = rect.y + rect.height; y < maxY; y++) {
			var xs = this._mask[y];

			for(var x = rect.x,  maxX = rect.x + rect.width; x < maxX; x++) {
				var areaX = x - rect.x;
				var areaY = y - rect.y;
				
				var pt = ((imageData.width * areaY) + areaX) << 2;
				if(xs[x] === Terrain.MASK_EMPTY) {
					imageData.data[pt] = 0xFF;
					imageData.data[pt + 1] = 0x0;
					imageData.data[pt + 2] = 0x0;
				}
				else {
					imageData.data[pt] = 0xFF;
					imageData.data[pt + 1] = 0xFF;
					imageData.data[pt + 2] = 0xFF;
				}
			}
		}
	},

	/**
	 * Does a line intersect with terrain?
	 * @param {Array} pointList List of points in a line
	 * @return {Point} Return intersection point or null if no intersection
	 */
	lineIntersects: function(pointList) {
		for(var i = 0; i < pointList.length; i++) {
			var p = pointList[i];
			if(this._mask[p.y]) {
				if(this._mask[p.y][p.x] == Terrain.MASK_GROUND) {
					return p;
				}
			}
		}

		return null;
	}
};
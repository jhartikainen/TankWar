/**
 * Describes the game terrain
 * @param {Array} p points that make up the terrain
 * @param {Array} mask Pixel mask for collisions etc.
 */
var Terrain = function(p, mask, size) {
	this._points = p;
	this._holes = [];
	this._mask = mask;
	this._size = size;
};

/**
 * Constant for empty area in mask
 * @type {Number}
 */
Terrain.MASK_EMPTY = 0x1;

/**
 * Constant for ground in the terrain mask
 * @type {Number}
 */
Terrain.MASK_GROUND = 0x2;

/**
 * Empty area that used to be ground (usually something that was destroyed in an explosion)
 * @type {Number}
 */
Terrain.MASK_DESTROYED = 0x4;

Terrain.prototype = {
	getSize: function() {
		return this._size;
	},
	
	setPattern: function(pattern) {
		this._pattern = pattern;
	},

	setBackground: function(image) {
		this._background = image;
	},

	/**
	 * Destroy terrain at point with specific blast radius
	 * @param {Point} midpoint
	 * @param {Number} radius
	 * @return {Rect} Rectangle which can be used for marking areas dirty for re-rendering after destroy
	 */
	destroy: function(midpoint, radius) {
		var points = Geom.plotFilledCircle(midpoint, radius);
		for(var i = 0; i < points.length; i++) {
			var point = points[i];

			if(this._mask[point.y] === undefined || this._mask[point.y][point.x] === undefined) {
				//This point is out of bounds
				continue;
			}
			
			var mask = this._mask[point.y][point.x];

			if(mask & Terrain.MASK_GROUND) {
				this._mask[point.y][point.x] = Terrain.MASK_EMPTY | Terrain.MASK_DESTROYED;
			}
		}

		return new Rect(midpoint.x - radius, midpoint.y - radius, radius * 2, radius * 2);
	},

	/**
	 * Render terrain
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(context) {
		/*for(var i = 0; i < imageData.data.length; i += 4) {
			imageData.data[i] = 0xFF;
			imageData.data[i + 1] = 0;
			imageData.data[i + 2] = 0xFF;
		}*/

		/*for(var y = 0; y < this._mask.length; y++) {
			var xs = this._mask[y];
			for(var x = 0; x < xs.length; x++) {
				var pt = ((imageData.width * y) + x) << 2;

				if(xs[x] === Terrain.MASK_EMPTY) {
					imageData.data[pt] = 0x0;
					imageData.data[pt + 1] = 250;
					imageData.data[pt + 2] = 255;
				}
				else {
					imageData.data[pt] = 0xFF;
					imageData.data[pt + 1] = 0xFF;
					imageData.data[pt + 2] = 0xFF;
				}
			}
		}*/

		/*context.fillStyle = 'lightblue';
		
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);*/

		//context.drawImage(this._background, 0, 0);

		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.beginPath();
		context.moveTo(this._points[0].x, this._points[0].y);
		for(var i = 1; i < this._points.length; i++) {
			context.lineTo(this._points[i].x, this._points[i].y);
		}

		context.lineTo(context.canvas.width, context.canvas.height);
		context.lineTo(0, context.canvas.height);
		context.lineTo(this._points[0].x, this._points[0].y);
		context.closePath();
		context.fillStyle = this._pattern;
		context.fill();

		this._imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
	},

	/**
	 * Get terrain data at point
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Number} Terrain mask constant
	 */
	get: function(x, y) {
		//"Sky" outside the map is empty
		if(y < 0) {
			return Terrain.MASK_EMPTY;
		}

		//"Ground" under the map is ground
		if(y >= this._mask.length) {
			return Terrain.MASK_GROUND;
		}
		
		if(this._mask[y] === undefined || this._mask[y][x] === undefined) {
			return undefined;
		}
		
		return this._mask[y][x];
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
				var scaledPt = ((this._imageData.width * y) + x) << 2;

				if(this._mask[y][x] & Terrain.MASK_DESTROYED) {
					imageData.data[pt] = 0xFF;
					imageData.data[pt + 1] = 0xFF;
					imageData.data[pt + 2] = 0xFF;
					imageData.data[pt + 3] = 0xFF;
				}
				else {
					imageData.data[pt] = this._imageData.data[scaledPt];
					imageData.data[pt + 1] = this._imageData.data[scaledPt + 1];
					imageData.data[pt + 2] = this._imageData.data[scaledPt + 2];
					imageData.data[pt + 3] = this._imageData.data[scaledPt + 3];
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
			
			if(this.get(p.x, p.y) & Terrain.MASK_GROUND) {				
				return p;
			}			
		}

		return null;
	}
};
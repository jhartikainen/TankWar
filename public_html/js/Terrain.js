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

Terrain.prototype = {
	/**
	 * Render terrain
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(imageData) {
		/*for(var i = 0; i < imageData.data.length; i += 4) {
			imageData.data[i] = 0xFF;
			imageData.data[i + 1] = 0;
			imageData.data[i + 2] = 0xFF;
		}*/

		for(var y = 0; y < this._mask.length; y++) {
			var xs = this._mask[y];
			if(!xs) {
				continue;
			}
			
			for(var x = 0; x < xs.length; x++) {
				if(xs[x] !== 1) {
					continue;
				}
				
				var pt = ((imageData.width * y) + x) << 2;
				imageData.data[pt] = 0xFF;
				imageData.data[pt + 1] = 0xFF;
				imageData.data[pt + 2] = 0xFF;
			}
		}
	},

	/**
	 * Perform a full render of the terrain
	 * @param {CanvasRenderingContext2D} context
	 */
	fullRender: function(context) {
		c.beginPath();
		c.moveTo(this._points[0].x, this._points[0].y);

		for(var i = 1, l = this._points.length; i < l; i++) {
			c.lineTo(this._points[i].x,this._points[i].y);
		}


		//Create destroyed areas
		for(var i = 0, l = this._holes.length; i < l; i++) {
			if(isNaN(this._holes[i].x) || isNaN(this._holes[i].y) || isNaN(this._holes[i].r)) {
                continue;
            }

			c.moveTo(this._holes[i].x,this._holes[i].y);
			c.arc(this._holes[i].x,this._holes[i].y,this._holes[i].r,0,PI2,false);
		}
		c.closePath();
	},

	/**
	 * Creates the path for the terrain
	 * @param {Object} c to create the path on
	 */
	createPath: function(c) {

	},

	/**
	 * Use to blow holes in the terrain
	 * @param {Object} Point object containing the X/Y location of the explosion
	 * @param {Number} radius of the explosion
	 */
	destroy: function(point,radius) {
		var h = {
			x: point.x,
			y: point.y,
			r: Number(radius)
		};
		this._holes.push(h);
	}
};
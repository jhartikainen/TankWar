/**
 * Describes the game terrain
 * @param {Object} p from TerrainCreator
 */
var Terrain = function(p) {
	this._points = p
	this._holes = [];

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
	getNormalAt: function(x) {
		var p1,p2;

		for(var i = 0; i < (this.pointCount-1); i++)
		{
			if(this._points[i].x <= x && this._points[(i+1)].x > x)
			{
				p1 = this._points[i];
				p2 = this._points[(i+1)];
				break;
			}
		}

		if(p1 && p2)
		{
			var v1 = new Vector2(p1.x,p1.y);
			var v2 = new Vector2(p2.x,p2.y);

			return v1.crossProduct(v2);
		}
		else
			return null;
	},

	getSurfaceAt: function(x) {
		var p1,p2;

		for(var i = 0; i < (this.pointCount-1); i++)
		{
			if(this._points[i].x <= x && this._points[(i+1)].x > x)
			{
				p1 = this._points[i];
				p2 = this._points[(i+1)];
				break;
			}
		}

		if(p1 && p2)
		{
			var v1 = new Vector2(p1.x,p1.y);
			var v2 = new Vector2(p2.x,p2.y);

			return v1.subtract(v2);
		}
		else
			return null;
	},

	/**
	 * Return lines from terrain, ie. connected points
	 * @return {Array}
	 */
	getLines: function() {
		var lines = [];
		opera.postError(this._points.length - 1);
		for(var i = 0, len = this._points.length - 1; i < len; i++) {
			lines.push({
				start: this._points[i],
				end: this._points[i + 1]
			});
		}

		opera.postError(lines.length);
		return lines;
	},

	getPoints: function() {
		return this._points;
	},

	getHoles: function() {
		return this._holes;
	},

	getLastHit: function() {
		if(this._holes.length > 0)
			return this._holes[(this._holes.length-1)];
		else
			return null;
	},

	clean: function() {
		this._holes = [];
	},

	createLastHitPath: function(c) {
		c.beginPath();
		var h = this.getLastHit();
		if(h != null)
			c.moveTo(h.x,h.y);

		if(h != null)
		{
			if(!isNaN(h.x) && !isNaN(h.y) && !isNaN(h.r))
			{
				c.moveTo(h.x,h.y);
				//opera.postError(h.x + ' ' + h.y + ' ' + h.r);
				c.arc(h.x,h.y,h.r,0,PI2,false);
			}
		}
		c.closePath();
	},

	removeLastHit: function() {
		this._holes.pop();
	},

	/**
	 * Render terrain
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(context) {
		context.fillStyle = '#5c4033';
		context.fillRect(0,0, context.canvas.width, context.canvas.height);

		context.fillStyle = this._clearColor;

		this.createPath(context);

		context.fill();
	},

	/**
	 * Creates the path for the terrain
	 * @param {Object} c to create the path on
	 */
	createPath: function(c) {
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
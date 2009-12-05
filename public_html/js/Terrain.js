/**
 * Describes the game terrain
 * @param {Object} p from TerrainCreator
 */
var Terrain = function(p) {
	var points = p
	var holes = new Array();

	this.clearColor = 'lightblue';

	//Added for customPolyCheck
	this.pointCount = points.length;
	this.xArray = new Array();
	this.yArray = new Array();

	for(var i = 0; i < this.pointCount; i++)
	{
		this.xArray.push(points[i].x);
		this.yArray.push(points[i].y);
	}
};

Terrain.prototype = {
	getNormalAt: function(x) {
		var p1,p2;

		for(var i = 0; i < (this.pointCount-1); i++)
		{
			if(points[i].x <= x && points[(i+1)].x > x)
			{
				p1 = points[i];
				p2 = points[(i+1)];
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
			if(points[i].x <= x && points[(i+1)].x > x)
			{
				p1 = points[i];
				p2 = points[(i+1)];
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

	getPoints: function() {
		return points;
	},

	getHoles: function() {
		return holes;
	},

	getLastHit: function() {
		if(holes.length > 0)
			return holes[(holes.length-1)];
		else
			return null;
	},

	clean: function() {
		holes = [];
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
		holes.pop();
	},

	/**
	 * Render terrain
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(context) {
		context.fillStyle = '#5c4033';
		context.fillRect(0,0, context.canvas.width, context.canvas.height);

		context.fillStyle = this.clearColor;

		this.createPath(context);

		context.fill();
	},

	/**
	 * Creates the path for the terrain
	 * @param {Object} c to create the path on
	 */
	createPath: function(c) {
		c.beginPath();
		c.moveTo(points[0].x, points[0].y);

		for(var i = 1, l = points.length; i < l; i++) {
			c.lineTo(points[i].x,points[i].y);
		}


		//Create destroyed areas
		for(var i = 0, l = holes.length; i < l; i++) {
			if(isNaN(holes[i].x) || isNaN(holes[i].y) || isNaN(holes[i].r)) {
                continue;
            }

			c.moveTo(holes[i].x,holes[i].y);
			c.arc(holes[i].x,holes[i].y,holes[i].r,0,PI2,false);
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
		holes.push(h);
	}
};
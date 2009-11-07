/**
 * Describes the game terrain
 * @param {Object} points from TerrainCreator
 */
function Terrain(p)
{
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
	
	
	this.getNormalAt = function(x)
	{
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
	}
	
	this.getSurfaceAt = function(x)
	{
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
	}
	
	this.getPoints = function()
	{
		return points;
	}
	
	this.getHoles = function()
	{
		return holes;
	}
	
	this.getLastHit = function()
	{
		if(holes.length > 0)
			return holes[(holes.length-1)];
		else
			return null;
	}
	
	this.clean = function()
	{
		holes = new Array();
	}
	
	this.createLastHitPath = function(c)
	{
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
	}
	
	this.removeLastHit = function()
	{
		holes.pop();
	}
	
	this.draw = function(c)
	{
		c.fillStyle = '#5c4033';
		c.fillRect(0,0,c.canvas.width,c.canvas.height);
	
		c.fillStyle = this.clearColor;
	
		this.createPath(c);
	
		c.fill();
	}
	/**
	 * Creates the path for the terrain
	 * @param {Object} canvas to create the path on
	 */
	this.createPath = function(c)
	{
		c.beginPath();
		c.moveTo(points[0].x,points[0].y);
		//c.moveTo(0,0);
		c.moveTo(points[0].x,points[0].y);
		
		for(var i = 1, l = points.length; i < l; i++)
		{		
			
			c.lineTo(points[i].x,points[i].y);		
		}
		
		
		//Create destroyed areas
		for(var i = 0, l = holes.length; i < l; i++)
		{
			if(isNaN(holes[i].x) || isNaN(holes[i].y) || isNaN(holes[i].r))
				continue;
			c.moveTo(holes[i].x,holes[i].y);
			c.arc(holes[i].x,holes[i].y,holes[i].r,0,PI2,false);
		}
		c.closePath();
	}
	
	/**
	 * Use to blow holes in the terrain
	 * @param {Object} Point object containing the X/Y location of the explosion
	 * @param {Number} radius of the explosion
	 */
	this.destroy = function(point,radius)
	{
		var h = {
			x: point.x,
			y: point.y,
			r: Number(radius)
		};
		holes.push(h);
	}
}

/**
 * Creates random terrain
 * @param {Object} ctx
 */
function TerrainCreator(ctx,baseH,hPoints,maxH,minH)
{	
	var baseHeight = (baseH) ? Number(baseH) : 300;
	var heightPoints = (hPoints) ? Number(hPoints) : 14;
	
	var maxHeight = (maxH) ? Number(maxH) : 100;
	var minHeight = (minH) ? Number(minH) : -100;
	
	var points = new Array();
	
	points.push(new Point(0,0));
	points.push(new Point(ctx.canvas.width,0));	
	points.push(new Point(ctx.canvas.width,getAHeight()));
	
	var step = Math.round(ctx.canvas.width / heightPoints);
	var cw = ctx.canvas.width;
	for(var i = 0; i < heightPoints; i++)
	{
		cw -= step;		
		points.push(new Point(cw,getAHeight()));
	}
	
	
	points.push(new Point(0,getAHeight()));	
	points.push(new Point(0,0));
	
	return new Terrain(points);
	
	function getAHeight()
	{
		var h = baseHeight;
		
		var r = (Math.round(Math.random()*(maxHeight-minHeight)))+minHeight;
		
		return h - r;
	}
	
}

function createNewMap()
{
	var inputs = terrainInputList.getValues();
	terrain = TerrainCreator(ctx,inputs[0],inputs[1],inputs[2],inputs[3]);
	draw();
}

function TC2(c)
{
	
}

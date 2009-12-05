function Tank(pos)
{
	this.position = new Vector2(pos.x,pos.y);
	this.velocity = new Vector2(0,0);
	this.turretAngle = 0;
	this.shotPower = 5;
	this.health = 100;
	this.weight = 2;

	this.healthObj = new PixelText(this.health);
	this.healthObj.color = 'black';

	var corners = new Array(
			new Point(this.position.x-7,this.position.y-8),
			new Point(this.position.x+14,this.position.y-8),
			new Point(this.position.x-7,this.position.y+8),
			new Point(this.position.x+14,this.position.y+8)
		);

	var prevDrawAngle = 0;

	this.destroy = function()
	{
		this.health = ' ';
		draw();
	}

	this.fire = function(c)
	{
		c.save();
		c.translate(this.position.x,this.position.y-8);

		var xv = Math.cos(this.turretAngle) * 10;
		var yv = Math.sin(this.turretAngle) * 10;
		c.translate(xv,yv);

		c.rotate(this.turretAngle);

		c.fillStyle = 'yellow';

		c.moveTo(0,0);
		c.beginPath();
		c.moveTo(0,0);
		c.lineTo(5,-5);
		c.lineTo(20,0);
		c.lineTo(5,5);
		c.lineTo(0,0);
		c.closePath();
		c.fill();

		c.moveTo(0,0);
		c.beginPath();
		c.moveTo(0,0);
		c.lineTo(-2,15);
		c.lineTo(2,0);
		c.lineTo(-2,-15);
		c.lineTo(0,0);
		c.closePath();
		c.fill();

		c.restore();
	}

	this.draw = function(c)
	{
		c.save();

		//Draw the bottom of the tank
		c.translate(this.position.x,this.position.y);

		c.fillStyle = 'black';

		c.fillRect(-7,-8,14,8)

		c.translate(0,-8);

		//Clear previous position of turret
		c.save();
		c.rotate(prevDrawAngle);
		c.fillStyle = terrain.clearColor;
		c.fillRect(0,-2,11,4);
		c.restore();

		if(this.health != ' ')
		{
			//Draw the cannon
			c.save();
			c.fillStyle = 'black';
			c.rotate(this.turretAngle);
			c.fillRect(0,-1,10,2);
			c.restore();

			prevDrawAngle = this.turretAngle;
		}

		//Draw the turret top
		c.moveTo(0,0);
		c.beginPath();
		c.moveTo(0,0);
		if(this.health == ' ')
			c.fillStyle = terrain.clearColor;
		else
			c.fillStyle = 'black';

		c.arc(0,0,5,0,PI2,false);
		c.closePath();
		c.moveTo(0,0);
		c.fill();

		c.restore();
	}

	this.checkRadius = function()
	{
		for(var i = 0; i < 4; i++)
		{
			if(ctx.isPointInPath(corners[i].x,corners[i].y))
				return true;
		}

		return false;
	}

	this.checkHit = function(x,y)
	{
		var w = tankSprite.width/2;
		var h = tankSprite.height;

		var x1 = this.position.x - w;
		var x2 = this.position.x + w;

		var y1 = this.position.y - h;
		var y1 = this.position.y;

		if(x > x1 && x < x2)
		{
			if(y > y1 && y < y2)
				return true;
		}

		return false;
	}

	this.createHitbox = function(c)
	{
		c.beginPath();

		c.rect(this.position.x-7,this.position.y-10,14,10)

		c.closePath();
	}
}

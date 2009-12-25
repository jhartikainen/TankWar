/**
 * A Tank which can shoot and blow stuff up!.$. or it's actually more like a static cannon..
 * @param {Point} pos
 */
var Tank = function(pos) {
	this.position = new Vector2(pos.x, pos.y);
	this.velocity = new Vector2(0, 0);
	this._turretAngle = 0;
	this._health = 100;

	this._PI2 = Math.PI * 2;
};

Tank.prototype = {
	destroy: function()	{
		this._health = 0;
	},

	/**
	 * Set turret angle
	 * @param {Number} angleRads Angle in radians
	 */
	setTurretAngle: function(angleRads) {
		this._turretAngle = angleRads;
	},

	/**
	 * Return turret angle
	 * @return {Number}
	 */
	getTurretAngle: function() {
		return this._turretAngle;
	},

	/**
	 * Return the rectangle around the tank for rendering purproses
	 * @return {Rect}
	 */
	getRect: function() {
		return new Rect(this.position.x - 11, this.position.y - 20, 22, 20);
	},

	/**
	 * Set position of the tank
	 * @param {Number} x
	 * @param {Number} y
	 */
	setPosition: function(x, y) {
		this.position = new Vector2(x, y);
	},

	shoot: function() {
		/*c.save();
		c.translate(this.position.x,this.position.y-8);

		var xv = Math.cos(this._turretAngle) * 10;
		var yv = Math.sin(this._turretAngle) * 10;
		c.translate(xv,yv);

		c.rotate(this._turretAngle);

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

		c.restore();*/
	},

	work: function(timeDelta, simulation) {
		
	},

	collision: function(terrain) {
		//no effect
	},
	
	/**
	 * Render tank
	 * @param {CanvasRenderingContext2D} context
	 */
	render: function(context) {						
		context.save();

		//Draw the bottom of the tank
		context.translate(~~this.position.x, ~~this.position.y);

		context.fillStyle = 'black';

		context.fillRect(-7,-8,14,8);

		context.translate(0,-8);
	
		if(this._health != ' ')
		{
			//Draw the cannon
			context.save();
			context.fillStyle = 'black';
			context.rotate(this._turretAngle);
			context.fillRect(0,-1,10,2);
			context.restore();
		}

		//Draw the turret top
		context.moveTo(0,0);
		context.beginPath();
		context.moveTo(0,0);

		context.fillStyle = 'black';

		context.arc(0, 0, 5, 0, this._PI2, false);
		context.closePath();
		context.moveTo(0,0);
		context.fill();

		context.restore();
	}
};
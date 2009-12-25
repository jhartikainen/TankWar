/**
 * A cannon shell
 * @param {Vector2} pos
 * @param {Vector2} velocity
 */
var Shell = function(pos) {
	this.position = new Vector2(pos.x, pos.y);
	this.velocity = new Vector2(0, 0);
};

Shell.prototype = {
	_smokeInterval: 0,
	_renderSmoke: false,

	/**
	 * Launch shell from its present position 
	 * @param {Number} angle
	 * @param {Number} power
	 */
	launch: function(angle, power) {
		var xv = Math.cos(angle) * power;
		var yv = Math.sin(angle) * power;
		
		this.velocity = new Vector2(xv, yv);
	},

	/**
	 * Collision with terrain callback
	 * @param {Terrain} terrain
	 * @param {Simulation} simulation
	 * @return {Rect} dirty rect
	 */
	collision: function(terrain, simulation) {
		simulation.removeObject(this);
		return terrain.destroy(this.position, 10);
	},

	work: function(timeDelta, simulation) {
		this._smokeInterval += timeDelta;

		//Emit smoke every once in a while
		if(this._smokeInterval >= 1) {
			this._smokeInterval = 0;

			//simulation.addObject(new Smoke(this.position));
		}
	},

	getRect: function() {
		return new Rect(this.position.x, this.position.y, 5, 5);
	},

	render: function(context) {
		context.save();
		context.fillStyle = 'red';
		context.fillRect(~~this.position.x, ~~this.position.y, 5, 5);
		context.restore();
		if(this._renderSmoke) {
		}
	}
};
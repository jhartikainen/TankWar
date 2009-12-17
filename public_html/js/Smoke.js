/**
 * Smoke
 * @param {Vector2} position
 */
var Smoke = function(position) {
	this.position = new Vector2(position.x, position.y);
};

Smoke.prototype = {
	_life: 10,

	work: function(timeDelta, simulation) {
		this._life -= timeDelta;

		if(this._life <= 0) {
			simulation.removeObject(this);
		}
	},

	render: function(renderer) {

	}
};
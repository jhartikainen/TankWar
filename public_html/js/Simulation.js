/**
 * Physics simulation
 * @param {Terrain} terrain
 */
var Simulation = function(terrain) {
	this._terrain = terrain;
	this._objects = [];
};

Simulation.prototype = {
	_objects: [],
	_gravity: 10,

	/**
	 * Step in the simulation
	 * @param {Number} timeDelta Simulation time step since last frame
	 */
	step: function(timeDelta) {
		var result = {
			dirtyRects: []
		};
		for(var i = 0, objectCount = this._objects.length; i < objectCount; i++) {
			var object = this._objects[i];

			//Calculate effect of gravity if object is in air
			if(this._terrain.get(object.position.x, object.position.y + 1) === Terrain.MASK_EMPTY) {
				object.velocity.y += (this._gravity * timeDelta);
			}

			//Calculate new location, taking time into account
			var newX = object.position.x + (object.velocity.x * timeDelta);
			var newY = object.position.y + (object.velocity.y * timeDelta);

			newX = ~~newX;
			newY = ~~newY;
			
			//Determine if the object collided with ground
			var line = Geom.plotLine(object.position.x, object.position.y, newX, newY);
			var collision = this._terrain.lineIntersects(line);

			if(collision) {
				result.dirtyRects.push(object.getRect());
				object.position.x = collision.x;
				object.position.y = collision.y;
				object.velocity.y = 0;
				object.velocity.x = 0;
			}
			else if(newX != object.position.x || newY != object.position.y) {
				result.dirtyRects.push(object.getRect());
				object.position.x = ~~newX;
				object.position.y = ~~newY;
			}
		}

		return result;
	}
};
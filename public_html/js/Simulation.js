/**
 * Physics simulation
 * @param {Terrain} terrain
 */
var Simulation = function(terrain) {
	this._terrain = terrain;
	this._objects = [];
	this._deadObjects = [];
	this._newObjects = [];
};

Simulation.prototype = {
	/**
	 * Objects in the simulation
	 * @type {Array}
	 */
	_objects: [],

	/**
	 * Objects that have "died", eg. will be removed after a sim step
	 * @type {Array}
	 */
	_deadObjects: [],

	/**
	 * New objects added to the simulation
	 * @type {Array}
	 */
	_newObjects: [],
	
	_gravity: 10,

	/**
	 * Add object into simulation (will be inserted when the next step starts)
	 * @param {Object} object
	 */
	addObject: function(object) {
		//Added into temp array so it won't mess up the current sim step (if active)
		this._newObjects.push(object);
	},

	/**
	 * Remove an object from the simulation (will be removed when the next step starts)
	 * @param {Object} object
	 */
	removeObject: function(object) {
		//Added into temp array so it won't mess up the current sim step (if active)
		this._deadObjects.push(object);
	},

	/**
	 * Step in the simulation
	 * @param {Number} timeDelta Simulation time step since last frame
	 * @return {Object} step result
	 */
	step: function(timeDelta) {
		var result = {
			dirtyRects: []
		};

		//Remove dead objects from the simulation
		for(var i = 0; i < this._deadObjects.length; i++) {
			var index = this._objects.indexOf(this._deadObjects[i]);
			if(index > -1) {
				this._objects.splice(index, 1);
			}
		}

		this._deadObjects = [];
		
		//Insert new objects into the simulation
		this._objects = this._objects.concat(this._newObjects);
		this._newObjects = [];

		var terrainSize = this._terrain.getSize();
		var terrainWidth = terrainSize.getWidth(),
			terrainHeight = terrainSize.getHeight();
		
		//Perform the simulation step
		for(var i = 0, objectCount = this._objects.length; i < objectCount; i++) {
			var object = this._objects[i];

			//Remove out-of-bounds objects
			if(object.position.x < 0 || object.position.x > terrainWidth) {
				this.removeObject(object);
				continue;
			}

			object.work(timeDelta, this);

			//Correct old position by flooring for various calculations
			var correctOldX = ~~object.position.x;
			var correctOldY = ~~object.position.y;

			//Calculate effect of gravity if object is in air
			if(correctOldY < terrainHeight && this._terrain.get(correctOldX, correctOldY + 1) & Terrain.MASK_EMPTY) {
				object.velocity.y += (this._gravity * timeDelta);
			}

			//Calculate new location, taking time into account
			var newX = object.position.x + (object.velocity.x * timeDelta);
			var newY = object.position.y + (object.velocity.y * timeDelta);

			//Correct X and Y (by rounding down) for collision and bounds checking
			var correctedX = ~~newX;
			var correctedY = ~~newY;

			var collision;
			//Collisions can only happen if the object is inside the map horizontally, and is not "above" the map
			if(terrainWidth > correctedX && correctedX >= 0 && correctedY >= 0) {
				//Determine if the object collided with ground
				var line = Geom.plotLine(correctOldX, correctOldY, correctedX, correctedY);
				line.push({
					x: correctedX,
					y: correctedY
				});
				collision = this._terrain.lineIntersects(line);
			}

			if(collision) {
				result.dirtyRects.push(object.getRect());
				object.position.x = collision.x;
				object.position.y = collision.y;
				object.velocity.y = 0;
				object.velocity.x = 0;

				var rect = object.collision(this._terrain, this);
				//Collision result may return a dirty rect
				if(rect) {
					result.dirtyRects.push(rect);
				}
			}
			else if(newX != object.position.x || newY != object.position.y) {
				result.dirtyRects.push(object.getRect());
				object.position.x = newX;
				object.position.y = newY;
			}
		}
		
		return result;
	}
};
/**
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Terrain} terrain
 */
var Renderer = function(context, terrain) {
	this._terrain = terrain;

	this._context = context;
	this._dirtyRects = [];
	this._sceneItems = [];
	this._backgroundItems = [];

	var terrainSize = terrain.getSize();
	
	this._bgCanvas = document.createElement('canvas');
	this._bgCanvas.width = terrainSize.getWidth();
	this._bgCanvas.height = terrainSize.getHeight();
	this._bgContext = this._bgCanvas.getContext('2d');
	
	this._bgContext.globalCompositeOperation = 'copy';

	this._terrainCanvas = this._bgCanvas.cloneNode(true);
	this._terrainContext = this._terrainCanvas.getContext('2d');
	this._terrain.render(this._terrainContext);	
};

Renderer.prototype = {
	_dirtyRects: [],

	_sceneItems: [],

	_backgroundItems: [],

	/**
	 * @type {CanvasRenderingContext2D}
	 */
	_context: null,

	addToBackground: function(renderable) {
		this._backgroundItems.push(renderable);	
	},

	/**
	 * Add a renderable object to the scene
	 * @param {Object} renderable
	 */
	addToScene: function(renderable) {
		this._sceneItems.push(renderable);
	},

	/**
	 * Remove something from the scene
	 * @param {Object} renderable
	 */
	removeFromScene: function(renderable) {
		var index = this._sceneItems.indexOf(renderable);
		if(index != -1) {
			this._sceneItems.splice(index, 1);
		}
	},

	/**
	 * Marks an area of the screen dirty for redrawing it before other things
	 * @param {Rect} rect
	 */
	markDirty: function(rect) {
		this._dirtyRects.push(rect);
	},

	prepareScene: function() {
		var terrainSize = this._terrain.getSize();
		var terrainRect = new Rect(0, 0, terrainSize.getWidth(), terrainSize.getHeight());
		
		for(var i = 0; i < this._dirtyRects.length; i++) {
			var rect = this._dirtyRects[i];
			if(terrainRect.intersects(rect)) {
				var intersection = terrainRect.getIntersectionRect(rect);
				var x = ~~intersection.x,
				    y = ~~intersection.y,
				    w = Math.ceil(intersection.width),
					h = Math.ceil(intersection.height);

				//If the area is empty skip the rect
				if(!w || !h) {
					continue;
				}
				
			    var imageData = this._terrainContext.getImageData(x, y, w, h);
				this._terrain.renderRect(imageData, new Rect(x, y, w, h));
				this._terrainContext.putImageData(imageData, x, y);
			}
		}

		this._dirtyRects = [];
	},

	/**
	 * Render a scene
	 */
	renderScene: function() {
		for(var i = 0; i < this._backgroundItems.length; i++) {
			this._backgroundItems[i].render(this._bgContext);
		}

		this._context.drawImage(this._terrain._background, 0, 0);
		this._context.drawImage(this._bgCanvas, 0, 0);
		this._context.drawImage(this._terrainCanvas, 0, 0);

		var terrainSize = this._terrain.getSize();
		var terrainRect = new Rect(0, 0, terrainSize.getWidth(), terrainSize.getHeight());

		for(var i = 0; i < this._sceneItems.length; i++) {
			if(terrainRect.containsRect(this._sceneItems[i].getRect())) {
		        this._sceneItems[i].render(this._context);
			}
		}
	},

	/**
	 * @return {CanvasRenderingContext2D}
	 */
	getContext: function() {
		return this._context;
	}
};
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
};

Renderer.prototype = {
	_dirtyRects: [],

	_sceneItems: [],

	/**
	 * @type {CanvasRenderingContext2D}
	 */
	_context: null,

	/**
	 * Add a renderable object to the scene
	 * @param {Object} renderable
	 */
	addToScene: function(renderable) {
		this._sceneItems.push(renderable);
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
			if(terrainRect.containsRect(rect)) {
			    var imageData = this._context.getImageData(rect.x, rect.y, rect.width, rect.height);
				this._terrain.renderRect(imageData, rect);
				this._context.putImageData(imageData, rect.x, rect.y);
			}
		}

		this._dirtyRects = [];
	},

	/**
	 * Render a scene
	 */
	renderScene: function() {
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
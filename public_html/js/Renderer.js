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

	this._bg = document.createElement('div');
	this._bg.style.position = 'relative';
	this._bg.style.backgroundImage = 'url(img/sky.jpg)';
	context.canvas.parentNode.appendChild(this._bg);
	this._bg.appendChild(context.canvas);
	context.canvas.style.position = 'absolute';
	context.canvas.style.left = '0px';
	context.canvas.style.top = '0px';
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

		for(var i = 0; i < this._backgroundItems.length; i++) {
			this._backgroundItems[i].render(this._bg);
		}
		
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
				
			    var imageData = this._context.getImageData(x, y, w, h);
				this._terrain.renderRect(imageData, new Rect(x, y, w, h));
				this._context.putImageData(imageData, x, y);
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
/**
 * Dynamic asset loader
 */
var Loader = function() {
};

Loader.prototype = {
	/**
	 * Number of assets to load
	 * @type {Number}
	 */
	_loadingCount: 0,

	/**
	 * Number of assets that have been loaded
	 * @type {Number}
	 */
	_loadedCount: 0,

	/**
	 * Return how many assets are being loaded
	 * @return {Number}
	 */
	getLoadingCount: function() {
		return this._loadingCount;
	},

	/**
	 * Return how many assets have been loaded
	 * @return {Number}
	 */
	getLoadedCount: function() {
		return this._loadedCount;
	},

	/**
	 * Load a list of image and class assets
	 * @param {Object} assets Use property 'classes' and 'images' as arrays that list assets to load
	 */
	loadAssets: function(assets) {
		if(assets.images) {
			for(var i = 0; i < assets.images.length; i++) {
				this.loadImage(assets.images[i]);
			}
		}

		if(assets.classes) {
			for(var i = 0; i < assets.classes.length; i++) {
				this.loadClass(assets.classes[i]);
			}
		}
	},

	loadImage: function(name) {
		this._loadingCount++;
		var image = new Image();
		image.onload = dojo.hitch(this, '_imageLoaded');
		image.onerror = dojo.hitch(this, '_imageLoadFailed');
		image.src = 'img/' + name;
	},

	/**
	 * Load a JS "class"
	 * @param {String} className
	 */
	loadClass: function(className) {
		this._loadingCount++;
		dojo.xhrGet({
			preventCache: true,
			url: 'js/' + className + '.js',
			handleAs: 'javascript',
			load: dojo.hitch(this, '_scriptLoaded'),
			error: dojo.hitch(this, '_scriptLoadFailed')
		});
	},

	/**
	 * Event fired when everything has been loaded
	 */
	onAllAssetsLoaded: function() { },

	/**
	 * Event fired when a single asset has been loaded
	 */
	onAssetLoaded: function() { },

	_loadStopped: function() {
		this._loadedCount++;

		this.onAssetLoaded();
		if(this._loadingCount == this._loadedCount) {
			this.onAllAssetsLoaded();
		}		
	},

	_scriptLoaded: function() {
		this._loadStopped();
	},

	_scriptLoadFailed: function() {
		throw new Error('Script loading failed');
	},

	_imageLoaded: function() {
		this._loadStopped();
	},

	_imageLoadFailed: function() {
		throw new Error('Image loading failed');
	}
};
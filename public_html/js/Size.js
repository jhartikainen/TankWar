/**
 * A size with a width and a height
 * @param {Number} width
 * @param {Number} height
 */
var Size = function(width, height) {
    this._width = width;
    this._height = height;
};

Size.prototype = {
    /**
     * @return {Number}
     */
    getHeight: function() {
        return this._height;
    },

    /**
     * @return {Number}
     */
    getWidth: function() {
        return this._width;
    }
};
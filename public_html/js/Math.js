/**
 * Convert degrees to radians
 * @param {Number} degrees
 * @return {Number}
 */
Math.deg2Rad = function(degrees) {
	return degrees * (Math.PI / 180);
};

/**
 * Convert radians to degrees
 * @param {Number} radians
 * @return {Number}
 */
Math.rad2Deg = function(radians) {
	return radians * (180 / Math.PI);
};
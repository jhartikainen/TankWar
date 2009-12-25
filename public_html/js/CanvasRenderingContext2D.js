/**
 * Canvas 2D rendering context interface. Mainly for completion etc. for IntelliJ
 */
var CanvasRenderingContext2D = {
	fillStyle: '',
	canvas: '',
	drawImage: function(image, x, y) { },
	fillRect: function(x, y, width, height) { },
	getImageData: function(x, y, width, height) { },
	putImageData: function(x, y, dataX, dataY, dataWidth, dataHeight) { },
	moveTo: function(x, y) { },
	lineTo: function(x, y) { },
	save: function() { },
	restore: function() { },
	rotate: function(angleRads) { },
	beginPath: function() { },
	closePath: function() { },
	arc: function(x, y, radius, startAngle, endAngle, antiClockwise) { },
	fill: function() { },
	translate: function(x, y) { }
};
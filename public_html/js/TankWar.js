/**
 * Game app controller
 */
var TankWar = function() {
};

TankWar.prototype = {
	/**
	 * Start application
	 */
	run: function() {
		var mapSize = new Size(1000, 400);
		var generator = new TerrainGenerator();
		var terrain = generator.generate(mapSize, 300, 14, 100, -100);

		var tiles = [];
		var tileDivisor = 25;
		for(var i = 0; i < tileDivisor; i++) {
			tiles[i] = new Array(tileDivisor);
		}

		var canvas = document.createElement('canvas');
		canvas.width = mapSize.getWidth();
		canvas.height = mapSize.getHeight();
		canvas.style.width = '1000px';
		canvas.style.height = '400px';

		document.body.appendChild(canvas);
		var context = canvas.getContext('2d');

		var line1 = [
			new Vector2(0, 0),
			new Vector2(10, 0)
		];

		var mode = 0;
		canvas.onclick = function(ev) {
			var x = ev.offsetX || ev.clientX;
			var y = ev.offsetY || ev.clientY;


			line1[mode].x = x;
			line1[mode].y = y;
			mode++;
			if(mode > 1) {
				mode = 0;
				drawLines();
			}
		};

		context.fillStyle = 'black';
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);

		var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
		terrain.render(imageData);
		context.putImageData(imageData, 0, 0);

		var canvasWidth = canvas.width;
		
		var drawLines = function() {
			//terrain.render(imageData);
			/*context.strokeStyle = 'black';
			context.lineWidth = 2;

			context.moveTo(line1[0].x, line1[0].y);
			context.lineTo(line1[1].x, line1[1].y);
			context.stroke();

			context.moveTo(line2[0].x, line2[0].y);
			context.lineTo(line2[1].x, line2[1].y);
			context.stroke();
			*/
	
			var points = generator._plotLine(line1[0].x, line1[0].y, line1[1].x, line1[1].y);

			//Determine the smallest rectangle we can fit the line into to speed up redraw
			var minX = points[0].x;
			var minY = points[0].y;
			var maxX = points[0].x;
			var maxY = points[0].y;

			for(var i = 1; i < points.length; i++) {
				if(points[i].x < minX) {
					minX = points[i].x;
				}
				else if(points[i].x > maxX) {
					maxX = points[i].x;
				}

				if(points[i].y < minY) {
					minY = points[i].y;
				}
				else if(points[i].y > maxY) {
					maxY = points[i].y;
				}
			}

			var areaW = maxX - minX + 1;
			var areaH = maxY - minY + 1;
			var imageData = context.getImageData(minX, minY, areaW, areaH);
			for(var i = 0; i < points.length; i++) {
				var x = points[i].x - minX;
				var y = points[i].y - minY;
				//<< 2 -> multiply by four but faster
				var pt = ((imageData.width * y) + x) << 2;
				imageData.data[pt] = 255;
				imageData.data[pt+1] = 255;
				imageData.data[pt+2] = 255;
			}
			context.putImageData(imageData, minX, minY);
			//~~ is same as Math.floor but faster
			/*var tileX = ~~(x / tileDivisor);
			var tileY = ~~(y / tileDivisor);

			var startX = tileX * tileDivisor;
			var endX = (tileX + 1) * tileDivisor;

			var startY = tileY * tileDivisor;
			var endY = (tileY + 1) * tileDivisor;

			var blitX = startX;
			var blitY = startY;
			endX -= startX;
			endY -= startY;

			startX = 0;
			startY = 0;

			var r = ~~(Math.random() * 256);
			var g = ~~(Math.random() * 256);
			var b = ~~(Math.random() * 256);
			for(var i = startY; i < endY; i++) {
				for(var j = startX; j < endX; j++) {
					var pt = ((imageData.width * i) + j) * 4;
					imageData.data[pt] = r;
					imageData.data[pt+1] = g;
					imageData.data[pt+2] = b;
				}
			}

			context.putImageData(imageData, blitX, blitY);*/
		};

		
		/*context.fillStyle='red';
		terrain.createPath(context);
		context.fill();*/

		var log = document.getElementById('log');


		var intersect = function() {
			var pts = terrain.getLines();
			for(var i = 0, len = pts.length; i < len; i++) {
				var point = Vector2.intersection(line1[0], line1[1], pts[i].start, pts[i].end);
				if(point instanceof Point) {
					context.clearRect(point.x, point.y, 5, 5);
				}
				else if(point) {
					opera.postError('lolx');
				}
			}

		}
	}
};
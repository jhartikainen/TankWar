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

		var canvas = document.createElement('canvas');
		canvas.width = mapSize.getWidth();
		canvas.height = mapSize.getHeight();

		document.body.appendChild(canvas);
		var context = canvas.getContext('2d');

		terrain.render(context);

		var mode = 1;
		var firstSet = false;

		var btn = document.createElement('button');
		btn.innerHTML = 'Line 1';
		btn.onclick = function() {
			mode = 1;
			firstSet = false;
		};
		document.body.appendChild(btn);

		var btn2 = btn.cloneNode(true);
		btn2.innerHTML = 'Line 2';
		btn2.onclick = function() {
			mode = 2;
			firstSet = false;
		};
		document.body.appendChild(btn2);

		var line1 = [
			new Vector2(0, 0),
			new Vector2(10, 0)
		];

		var line2 = [
			new Vector2(0, 100),
			new Vector2(10, 100)
		];

		canvas.onclick = function(ev) {
			var x = ev.offsetX;
			var y = ev.offsetY;

			var line = mode == 1 ? line1 : line2;

			if(firstSet) {
				line[1].x = x;
				line[1].y = y;
				drawLines();
				intersect();
				firstSet = false;
			}
			else {
				firstSet = true;
				line[0].x = x;
				line[0].y = y;
			}
		};

		var drawLines = function() {
			terrain.render(context);
			context.strokeStyle = 'black';
			context.lineWidth = 2;

			context.moveTo(line1[0].x, line1[0].y);
			context.lineTo(line1[1].x, line1[1].y);
			context.stroke();

			context.moveTo(line2[0].x, line2[0].y);
			context.lineTo(line2[1].x, line2[1].y);
			context.stroke();
		};

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
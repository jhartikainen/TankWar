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
		var canvas = document.createElement('canvas');
		canvas.width = mapSize.getWidth();
		canvas.height = mapSize.getHeight();
		canvas.style.width = '1000px';
		canvas.style.height = '400px';

		document.body.appendChild(canvas);
		var context = canvas.getContext('2d');

		var generator = new TerrainGenerator();

		var terrain = generator.generate(mapSize, 300, 14, 100, -100);
		var img = new Image();
		img.src = 'img/ground_tile.jpg';
		var pattern = context.createPattern(img, 'repeat');
		terrain.setPattern(pattern);

		var img2 = new Image();
		img2.src = 'img/sky.jpg';
		terrain.setBackground(img2);

		var renderer = new Renderer(context, terrain);

		terrain.render(context);
		var tank = new Tank(new Point(100, 100));

		var sim = new Simulation(terrain);
		sim.addObject(tank);
		renderer.addToScene(tank);

		var worker = function(){
			var result = sim.step(0.1);
			var dirtyRects = result.dirtyRects;

			dirtyRects.push(tank.getRect());
			
			for(var i = 0; i < result.dirtyRects.length; i++) {
				renderer.markDirty(result.dirtyRects[i]);
			}

			
			renderer.prepareScene();
			renderer.renderScene();
			setTimeout(worker, 10);
		};

		worker();

		canvas.onclick = function(ev) {
			var x = ev.offsetX || ev.clientX;
			var y = ev.offsetY || ev.clientY;

			tank.shoot();
			var shell = new Shell(new Vector2(tank.position.x, tank.position.y - 5));			
			shell.launch(tank.getTurretAngle(), tank.position.distanceTo(new Vector2(x, y)));
			sim.addObject(shell);
			renderer.addToScene(shell);		
		};

		var log = dojo.byId('log');
		dojo.connect(sim, 'addObject', function() {
			log.innerHTML = 'Sim objects: ' + (sim._objects.length + sim._newObjects.length);
		});
		canvas.onmousemove = function(ev) {
			var x = ev.offsetX || ev.clientX;
			var y = ev.offsetY || ev.clientY;
			
			var angle = Geom.lineAngle(tank.position, new Point(x, y));
			tank.setTurretAngle(angle);
		};


		//terrain.render(context);

		/*var canvasWidth = canvas.width;

		var tank = new Tank(new Point(100, 100));
		tank.render(context);

		var sim = new Simulation(terrain);
		var renderer = new Renderer(context, terrain);
		sim._objects.push(tank);
		setInterval(function(){
			var result = sim.step(0.1);
			var dirtyRects = result.dirtyRects;
			if(dirtyRects.length == 0) {
				dirtyRects.push(tank.getRect());
			}
			for(var i = 0; i < result.dirtyRects.length; i++) {
				var imageData = context.getImageData(dirtyRects[i].x, dirtyRects[i].y, dirtyRects[i].width, dirtyRects[i].height);
				terrain.renderRect(imageData, dirtyRects[i]);
				context.putImageData(imageData, dirtyRects[i].x, dirtyRects[i].y);
			}
			
			tank.render(renderer);
		}, 10);
*/
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
	
			var points = Geom.plotLine(line1[0].x, line1[0].y, line1[1].x, line1[1].y);

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

			var collision = terrain.lineIntersects(points);
			for(var i = 0; i < points.length; i++) {
				var x = points[i].x - minX;
				var y = points[i].y - minY;
				//<< 2 -> multiply by four but faster
				var pt = ((imageData.width * y) + x) << 2;
				if(collision) {
					imageData.data[pt] = 255;
					imageData.data[pt+1] = 0;
					imageData.data[pt+2] = 0;
				}
				else {
					imageData.data[pt] = 255;
					imageData.data[pt+1] = 255;
					imageData.data[pt+2] = 255;
				}
			}

			context.putImageData(imageData, minX, minY);

			if(collision) {
				context.fillStyle = 'red';
				context.fillRect(collision.x, collision.y, 5, 5);
			}
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
	}
};
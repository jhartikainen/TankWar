/*function BasePlayer(n) 
{
	this.name = n;
	this.tank = null;
	
	this.weapons = {
		bignuke: new Cannon(50,25,2,this),
		mininuke: new Cannon(25,15,5,this),
		cannon: new Cannon(10,10,999,this),
		sandeater: new Cannon(25,0,5,this),
		teleport: new Cannon(5,0,2,this,'teleport'),
		mirv: new Cannon(15,25,5,this),
		artillery: new Cannon(1,0,5,this)
		};
			

	this.weapons.artillery.callback = function()
	{
		var pos = new Vector2(this.position.x,this.position.y);
		pos.y = 0;
		pos.x -= 20;
		
		var s = new Shell(new Vector2(pos),new Vector2(0,-2),15,15,this.shooter);
		engine.addObject(s);
		pos.x += 20;
		
		s = new Shell(new Vector2(pos),new Vector2(0,-2),15,15,this.shooter);
		engine.addObject(s);
		
		pos.x += 20;
		s = new Shell(new Vector2(pos),new Vector2(0,-2),15,15,this.shooter);
		engine.addObject(s);
	}
		
	
	this.weapons.mirv.hasLife = true;
	this.weapons.mirv.life = 2;
	this.weapons.mirv.callback = function()
	{
		var pos = new Vector2(this.position.x,this.position.y);
		var vel = new Vector2(1,1);
		
		var s = new Shell(new Vector2(pos),new Vector2(7,5),this.radius,this.damage,this.shooter);
		engine.addObject(s);
		
		s = new Shell(new Vector2(pos),new Vector2(2,5),this.radius,this.damage,this.shooter);		
		engine.addObject(s);
		
		s = new Shell(new Vector2(pos),new Vector2(-4,5),this.radius,this.damage,this.shooter);
		engine.addObject(s);
		
		s = new Shell(new Vector2(pos),new Vector2(-7,5),this.radius,this.damage,this.shooter);		
		engine.addObject(s);
	}
	
	this.weapons.teleport.callback = function()
	{
		if(this.position.x > 0 && this.position.x < canvasW)
		{
			this.shooter.tank.position.x = this.position.x;
			this.shooter.tank.position.y = this.position.y;
		}
	}
	
	this.selectedWeapon = this.weapons.cannon;
	this.weaponName = 'cannon';

	this.setTank = function(t) {
		this.tank = t;

		//Place tank on ground		
		var x = this.tank.position.x;
		terrain.createPath(ctx);
	
		//find the ground on tanks' vertical position
		for(var y = 0; y < canvasH; y++)
		{
			//if x,y is inside the path, ground isn't reached
			var hitcheck = customPolyCheck(x,y);
			if(!gctx.checkCollision(x,y) && !hitcheck)
			{
				this.tank.position.y = y-1;
				break;
			}
		}
	}
	this.startTurn = function() {},
	this.changeWeapon = function(name) {
		if(this.weapons[name].ammo > 0)
		{
			this.selectedWeapon = this.weapons[name];
			this.weaponName = name;
			
			if(server)
				server.changeWeapon(name);
			
			return true;
		}
		else
			return false;
	}
	this.shoot = function() {}
	this.endTurn = function() {}
	this.die = function() {}
}*/

function HumanPlayer(n)
{
	this.name = n;
	this.tank = null;
		
	var lastClick = null;
	
	this.weapons = createWeapons(this);
	 
	
	this.selectedWeapon = this.weapons.cannon;
	this.weaponName = 'cannon';
	
	this.setTank = function(t)
	{
		this.tank = t;

		//Place tank on ground		
		var x = this.tank.position.x;
		terrain.createPath(ctx);
	
		//find the ground on tanks' vertical position
		for(var y = 1; y < canvasH; y++)
		{
			//if x,y is inside the path, ground isn't reached
			if(!ctx.isPointInPath(x,y))
			{
				this.tank.position.y = y-1;
				break;
			}
		}
	}
	
	this.changeWeapon = function(name)
	{		
		if(this.weapons[name].ammo > 0)
		{
			this.selectedWeapon = this.weapons[name];
			this.weaponName = name;
			
			if(server)
				server.changeWeapon(name);
			
			return true;
		}
		else
			return false;
	}
	
	this.startTurn = function()
	{
		showMessage('Turn: '+this.name,3000);
		
		
		if(lastClick != null)
		{
			//If user has shot before, display a cross
			//in the point he clicked to help him aim
			var x = lastClick.x;
			var y = lastClick.y;
		
			ctx.fillStyle = 'black';
			ctx.fillRect(x-2,y,5,1);
			ctx.fillRect(x,y-2,1,5);
		}
		
		curPlayer = this;
		gameState = states.play;		
	}
	
	this.endTurn = function()
	{				
		draw();
		if(server)
		{
			server.syncPositions = true;
			server.sendImpacts();
			server.sendHealths();
			server.sync();
		}	
		else
			nextPlayer();		
	}
	
	this.shoot = function()
	{
		gameState = states.wait;

		var p = this.tank.position;		
		var angle = Math.atan2(-(p.y-mouseY),-(p.x-mouseX));
		
		//Cant shoot down!
		if(angle > 0)
		{
			gameState = states.play;
			return;
		}
		
		var v1 = new Vector2(p.x,p.y);
		var v2 = new Vector2(mouseX,mouseY);		 
		
		var power = v1.subtract(v2).getLength();
		
		lastClick = new Point(mouseX,mouseY);
		
		v1 = new Vector2(this.tank.position.x,this.tank.position.y-10);
		
		var xv = Math.cos(angle) * power;
		var yv = Math.sin(angle) * power;
		
		v2 = new Vector2(xv,yv);
		
		this.tank.fire(ctx);
		engine.addObject(this.selectedWeapon.makeShell(v1,v2))
		if(server)
			server.shoot(angle,power);		
		if(this.selectedWeapon.ammo == 0)
			this.changeWeapon('cannon');
		/*engine.addShell(
			new Point(this.tank.position.x,this.tank.position.y-10),
			angle,
			power
			);*/
		
		var px = new PixelText(randomShootQuote());
		px.color = 'black';	
		var w = px.getWidth();
		
		ctx.save();
		ctx.translate(this.tank.position.x-w,this.tank.position.y-70);		
		ctx.scale(2,2);				
		px.draw(ctx);
		ctx.restore();
		
		engine.start();
	}
	
	this.die = function()
	{
		this.tank.destroy();
	}
}

function NetworkPlayer(n)
{
	this.name = n;
	this.tank = null;
		
	var lastClick = null;
	
	this.weapons = createWeapons(this);
	
	this.selectedWeapon = this.weapons.cannon;
	this.weaponName = 'cannon';
	
	this.setTank = function(t)
	{
		this.tank = t;

		//Place tank on ground		
		var x = this.tank.position.x;
		terrain.createPath(ctx);
	
		//find the ground on tanks' vertical position
		for(var y = 1; y < canvasH; y++)
		{
			//if x,y is inside the path, ground isn't reached
			//var hitcheck = customPolyCheck(x,y);
			//if(!gctx.checkCollision(x,y) && !hitcheck)
			if(!ctx.isPointInPath(x,y))
			{
				this.tank.position.y = y-1;
				break;
			}
		}
	}
	
	this.changeWeapon = function(name)
	{		
		/*if(this.weapons[name].ammo > 0)
		{
			this.selectedWeapon = this.weapons[name];
			this.weaponName = name;
			return true;
		}
		else
			return false;*/
		this.selectedWeapon = this.weapons[name];
		this.weaponName = name;
		
		return true;
	}
	
	this.startTurn = function()
	{
		showMessage('Turn: '+this.name,3000);		
		curPlayer = this;
	}
	
	this.endTurn = function()
	{
		draw();
		//server.sync(); //should be synced after getting impacts		
	}
	
	this.shoot = function(a,p)
	{
		var v1 = new Vector2(this.tank.position.x,this.tank.position.y-10);
		
		var xv = Math.cos(a) * p;
		var yv = Math.sin(a) * p;
		
		var v2 = new Vector2(xv,yv);
		
		this.tank.turretAngle = a;
		this.tank.draw(ctx);
		this.tank.fire(ctx);
				
		engine.addObject(this.selectedWeapon.makeShell(v1,v2))		
		engine.start();
	}
	
	this.die = function()
	{
		this.tank.destroy();
	}
}

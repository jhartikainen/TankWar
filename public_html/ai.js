
function ComputerPlayer(n)
{
	var AIDEBUG = false;
	
	this.name = n;
	this.tank = null;
		
	var lastClick = null;
	
	this.weapons = createWeapons(this);
	 
	
	this.selectedWeapon = this.weapons.cannon;
	this.weaponName = 'cannon';
	
	var angleStep = 0.1;
	var powerStep = 15;
	
	var minAngle = -2.2;
	var maxAngle = -0.5;
	
	var minPower = 100;
	
	var lastAngle = null;
	var lastPower = null;
	var lastWind = null;
	var lastHit = null;	
	var opponentPosition = null;
	var opponentDirection = 0;
	var myPosition = null;
	
	this.setTank = function(t)
	{
		this.tank = t;

		//Place tank on ground		
		var x = this.tank.position.x;
		terrain.createPath(ctx);
	
		//find the ground on tanks' vertical position
		for(var y = 0; y < canvasH; y++)
		{
			//if x,y is inside the path, ground isn't reached
			if(!ctx.isPointInPath(x,y))
			{
				this.tank.position.y = y-1;
				break;
			}
		}
		
		myPosition = new Vector2(this.tank.position.x,this.tank.position.y);
	}
	
	this.changeWeapon = function(name)
	{
		if(this.weapons[name].ammo > 0)
		{
			this.selectedWeapon = this.weapons[name];
			this.weaponName = name;
			return true;
		}
		else
			return false;
	}
	
	this.startTurn = function()
	{
		showMessage(this.name,2000);
		curPlayer = this;
		gameState = states.wait;
		
		if(AIDEBUG)
			opera.postError('Health: '+this.tank.health);
		
		//First, find the closest enemy tank if don't already have a target
		if(opponentPosition == null)
		{
			var dist = 999999999;
			for(var i = 0, l = players.length; i < l; i++)
			{
				if(players[i] != this)
				{					
					var pos = new Vector2(players[i].tank.position.x,players[i].tank.position.y);
					var distTo = myPosition.subtract(pos).getLength();					
					if(distTo < dist)
					{
						opponentPosition = pos;
						
						dist = distTo;
						
						//Get shooting direction
						if(this.tank.position.x > opponentPosition.x)
							opponentDirection = 0;
						else
							opponentDirection = 1;
					}
				}
			}
		}		
		
		var a,p;
		
		var wind = engine.wind;
		
		//shoot randomly towards opponent if haven't shot at all yet
		if(lastHit == null)
		{
			var p = 200;
			var a;
			var qpi = Math.PI/4
			if(opponentDirection == 0)
				a = Random(minAngle,-(Math.PI/2)-qpi);
			else
				a = Random(-(Math.PI/2)+qpi,maxAngle);
		}
		else
		{			
			//Find how far the last shot went from the enemy
			var dist = opponentPosition.distanceTo(lastHit);
			
			//Use cannon by default
			this.changeWeapon('cannon');
			
			//If it was pretty close, try with a better weapon
			if(dist < 60)
			{
				//try bignuke first
				var hasAmmo = this.changeWeapon('bignuke');
				
				//If there's no ammo try mininuke
				if(!hasAmmo)
					this.changeWeapon('mininuke');
			}
			
			if(AIDEBUG)
				opera.postError('Enemy distance: '+dist);
			
			var powerModifier;
			if(dist > 70)
				powerModifier = 3;
			else if(dist > 50 && dist < 70)			
				powerModifier = 0.5;			
			else if(dist > 30 && dist < 50)
				powerModifier = 0.2;
			else if(dist < 30)
				powerModifier = 0;
			else
				powerModifier = 1;
			
			//Find the side of the enemy the shot went to
			var side;
			
			if(opponentPosition.x > lastHit.x)
				side = 0;
			else
				side = 1;
					
			//Figure out if we have to shoot with more/less power
			//Opponent is at right side
			//Shot went to left side
			if((side == 0 && opponentDirection == 1) || (side == 1 && opponentDirection == 0))
				p = lastPower + (powerStep*powerModifier);
			else //right side
				p = lastPower -  (powerStep*powerModifier);
									
			//p += Math.random() + wind*10;
			var windDir = (wind > 0) ? 1 : 0;
			var lastWindDir = (lastWind > 0) ? 1 : 0;
			
			if(windDir == lastWindDir)
			{
				if(windDir != opponentDirection)
				{
					if(wind > lastWind)
						p += (wind-lastWind)*10;
					else if(wind < lastWind)
						p -= (lastWind-wind)*10;
				}
				else
				{
					if(wind > lastWind)
						p -= (wind-lastWind)*10;
					else if(wind < lastWind)
						p += (lastWind-wind)*10;
				}
			}
			else
			{
				if((wind < 0 && windDir == opponentDirection) || (windDir != opponentDirection && wind > 0))
					p -= wind*10;
				else
					p += wind*10; 				
			}
				
			a = lastAngle;
			
		}
		this.shoot(a,p);
	}
	
	this.shoot = function(a,p)
	{
		gameState = states.wait;
		lastAngle = a;
		lastPower = p;
		lastWind = engine.wind;
		
		var v1 = new Vector2(this.tank.position.x,this.tank.position.y-10);
		
		var xv = Math.cos(a) * p;
		var yv = Math.sin(a) * p;
		
		var v2 = new Vector2(xv,yv);
		
		this.tank.turretAngle = a;
		this.tank.draw(ctx);
		this.tank.fire(ctx);
		
		/*engine.addShell(
			new Point(this.tank.position.x,this.tank.position.y-10),
			a,
			p
		)*/
		engine.addObject(this.selectedWeapon.makeShell(v1,v2))
		engine.start();
	}
	
	this.endTurn = function()
	{		
		lastHit = terrain.getLastHit();
		nextPlayer();
	}
	
	this.die = function()
	{
		this.tank.destroy();
	}
}

function Cannon(rad,dmg,ammo,owner,type)
{
	this.radius = rad;
	this.damage = dmg;	
	this.ammo = ammo;
	this.owner = owner;
	this.hitGround;
	this.hitTank;
	this.hasLife = false;
	this.life = 0;
		
	if(!type)
		this.type = 'normal';
	else
		this.type = type;
	
	
	
	this.makeShell = function(pos,vel)
	{
		if(this.ammo > 0)
		{
			this.ammo--;
			var s = new Shell(pos,vel,this.radius,this.damage,this.owner,this.hitGround);
			//stuff... constructor params would get kinda long..
			s.hitTank = this.hitTank;
			s.type = this.type;
			s.hasLife = this.hasLife;
			s.life = this.life;
			return s;
		}
		else
			return null;
	}
}

function Shell(pos,vel,rad,dmg,shooter,callback)
{
	this.position = pos;
	this.velocity = vel;
	this.radius = rad;
	this.weight = 0;
	this.damage = dmg;
	this.shooter = shooter;
	this.type = 'normal';
	this.hitGround = callback;
	this.hitTank;
	this.life = 0;
	this.hasLife = false;
}


function createWeapons(plr)
{
	var weapons = {
		bignuke: new Cannon(50,25,2,plr),
		mininuke: new Cannon(25,15,5,plr),
		cannon: new Cannon(10,10,999,plr),
		sandeater: new Cannon(25,0,5,plr),
		teleport: new Cannon(5,0,2,plr,'teleport'),
		mirv: new Cannon(15,25,5,plr),
		artillery: new Cannon(1,0,5,plr),
		bomber: new Cannon(15,5,5,plr)
		};
	

	weapons.bomber.hasLife = true;
	weapons.bomber.life = 0.2;
	weapons.bomber.droplets = 5;
	weapons.bomber.hitGround = function()
	{		
		if(this.life > 0)
			return;
		
		var pos = new Vector2(this.position.x,this.position.y);
		var vel = new Vector2(this.velocity.x,this.velocity.y);
		var projectile = new Shell(pos,vel,this.radius,this.damage,this.shooter);
		
		if(!this.droplets)
			this.droplets = 5;
		 
		if(this.droplets > 0)
		{
			vel = new Vector2(0,5);
			var d = new Shell(pos,vel,this.radius,this.damage,this.shooter);
			engine.addObject(d);
			
			projectile.hitGround = this.hitGround;
			projectile.hasLife = true;		
			projectile.life = 0.2;
			projectile.droplets = this.droplets - 1;			
		}

		
		engine.addObject(projectile);
	}	
	
	weapons.artillery.hitGround = function()
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
	weapons.artillery.hitTank = weapons.artillery.hitGround;
	
	weapons.mirv.hasLife = true;
	weapons.mirv.life = 2;
	weapons.mirv.hitGround = function()
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
	
	weapons.teleport.hitGround = function()
	{
		if(this.position.x > 0 && this.position.x < canvasW)
		{
			this.shooter.tank.position.x = this.position.x;
			this.shooter.tank.position.y = this.position.y;
		}
	}
	return weapons;
}
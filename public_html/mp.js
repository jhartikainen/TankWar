var createGameMenu,createGameInputs,passwordMenu,passwordField;
var uid=null,myname='';
function initMP()
{				
	createLobbyMenu();
	createPasswordMenu();
	
	createGameMenu = new Menu();
	//createGameMenu.addTitle('Create game');
	createGameMenu.obj.id = 'createGameMenu';
	
	var img = new Image();
	img.src = 'creategame.png';
	createGameMenu.obj.appendChild(img);
	
	createGameInputs = new InputList(-1,-1);
	createGameInputs.showButtons = false;
	createGameInputs.appendTo(createGameMenu.obj);
	createGameInputs.addField('number','Player amount',2,2,8);
	createGameInputs.addField('text','Password?');
	
	createGameMenu.obj.appendChild(createElement('br'));
	createGameMenu.addButton('New Map',createNewMap);
	createGameMenu.addButton('Map Settings','menuHandler.showMenu(terrainMenu)');
	createGameMenu.addButton('Select weapons','menuHandler.showMenu(ammoMenu)');
	createGameMenu.obj.appendChild(createElement('br'));
	createGameMenu.addButton('Start game',hostMPGame);
	createGameMenu.addButton('Cancel','menuHandler.closeMenu()');
	
	server = new Server();	

	dojox.cometd.init({
		url: requestPath
	});
	dojox.cometd.subscribe('/tankwar/*', handleCometEvent);
}

function createPasswordMenu()
{
	passwordMenu = new Menu();
	//passwordMenu.addTitle('Password?');
	var img = new Image();
	img.src = 'joingame.png';
	passwordMenu.obj.appendChild(img);
	
	passwordMenu.obj.appendChild(createElement('br'));
	
	var txt = createElement('span');
	txt.innerHTML = 'Password? ';
	passwordMenu.obj.appendChild(txt);
	
	passwordField = createElement('input');
	passwordField.type = 'password';
	passwordMenu.obj.appendChild(passwordField);
	
	passwordMenu.addButton('OK',passwordJoin);
}

function createLobbyMenu()
{
	var d = mpMenu.obj;
	d.id = 'lobby';
	d.innerHTML = '';
	
	var top = createElement('div','lobbyTop');
	var msg = createElement('span','lobbyMessage');
	msg.innerHTML = '&nbsp;';
	top.appendChild(msg);	
	d.appendChild(top);
	
	var l = createElement('div','lobbyLeft','float');
	l.innerHTML = 'Users<br />';
	var ul = createElement('select','userList');
	ul.size = 7;
	l.appendChild(ul);
	
	l.appendChild(createElement('br'));
	l.appendChild(createElement('br'));
	var spn = createElement('span');
	spn.innerHTML = 'Games';
	l.appendChild(spn);
	l.appendChild(createElement('br'));
	
	ul = createElement('select','roomList');
	ul.size = 7;
	l.appendChild(ul);
	
	l.appendChild(createElement('br'));
	
	var btn = createElement('input');	
	btn.type = 'button';
	btn.value = 'Join';
	btn.onclick = joinGame;
	l.appendChild(btn);
		
	l.appendChild(createElement('br'));
	
	btn = createElement('input');
	btn.type = 'button';
	btn.value = 'Create';
	btn.onclick = createGame;
	l.appendChild(btn);
	
	l.appendChild(createElement('br'));
	
	btn = createElement('input');
	btn.type = 'button';
	btn.value = 'Leave';
	btn.onclick = leaveOnline;
	l.appendChild(btn);
	
	d.appendChild(l);
	
	var m = createElement('div','chatHolder','float');
	m.appendChild(createElement('div','chat'));
	
	var i = createElement('input','message','','');
	i.onkeyup = keyUp;
	m.appendChild(i);
	
	i = createElement('input');
	i.type = 'button';
	i.value = 'Send';
	i.onclick = sendMsg;
	m.appendChild(i);
	m.appendChild(createElement('br'));
	
	var priv = createElement('input','privateMessage','','background: silver');
	priv.type = 'checkbox';
	priv.name = 'privateMessage';
	priv.value = '1';
	m.appendChild(priv);
	var txt = createElement('span');
	txt.innerHTML = 'Private to selected user';
	m.appendChild(txt);
	
	d.appendChild(m);	
}

function handleCometEvent(message) {
	var handlers = {
		'session-id': sessID,
		system: systemHandler,
		chat: chatHandler,
		names: userListHandler,
		rooms: roomListHandler,
		join: userJoin,
		part: userPart,
		'console-message': consoleMessage,
		nameerror: server.nameError,
		gamehosted: server.gameHosted,
		gamejoined: server.gameJoined,
		gamejoin: server.userJoins,
		wrongpass: server.wrongPass,
		gameleave: server.userLeaves,
		gameleft: server.gameLeft,
		map: server.gotMap,
		weapons: server.gotWeapons,
		startgame: server.startGame,
		turn: server.startTurn,
		tanks: server.gotTanks,
		shoot: server.gotShot,
		weaponchanged: server.weaponChanged,
		impacts: server.gotImpacts,
		wind: server.gotWind,
		health: server.gotHealth,
		positions: server.gotPositions
	};

	var channel = message.channel.split(/\//g);
	handlers[channel[2]].call(this, message.data);
}

function leaveOnline()
{
	myname = '';
	dojox.cometd.disconnect();
	menuHandler.closeMenu();
	server = null;
	engine.onstop = null;
}

function userJoin(event)
{
	addMessage('<b>'+event + ' joins</b>');
}

function userPart(event)
{
	addMessage('<b>'+event+' leaves</b>');
}

function consoleMessage(event)
{
	addMessage('<b>Message from the server admin: '+event+'</b>');
}

function addMessage(data)
{
	var el = $(server.chat);	
	if(!el) {
		return;
	}
	//document.getElementById('chat').innerHTML += data+'<br>';
	el.innerHTML += data+'<br>';
		
	scrollChat();
}

function sessID(sessionId)
{	
	uid = sessionId;
}


function userListHandler(names)
{	
	var l = $('userList');

	while(l.options.length > 0)
	{
		l.remove(0);
	}
	
	for(var u = 0; u < names.length; u++)
	{
		var opt = document.createElement('option');
		opt.value = names[u];
		opt.innerHTML = names[u];
		l.appendChild(opt);
	}
}

var rooms = new Array();
function roomListHandler(names)
{
	var l = $('roomList');
	rooms = new Array();
	while(l.options.length > 0)
	{
		l.remove(0);
	}
	
	for(var u = 0; u < names.length; u++)
	{
		var n = names[u].split(',');
		
		var opt = document.createElement('option');
		opt.value = n[0];
		opt.innerHTML = n[0];
		l.appendChild(opt);
		
		var room = {
			name: n[0],
			password: (n.length>1) ? true : false
		}
		
		rooms.push(room);
	}
}
function chatHandler(data)
{
	addMessage('<b>'+data[0]+'</b>&gt; '+data[1]);	
}

function scrollChat()
{
	$(server.chat).scrollTop = $(server.chat).scrollHeight;
}

function systemHandler(data)
{
	addMessage('<b>'+data+'</b><br />');	
}

function joinGame()
{
	var r = $('roomList');
	if(r.selectedIndex == -1)
		return;
		
	var rname = r.options[r.selectedIndex].value;	
	
	if(rooms[r.selectedIndex].password)
		menuHandler.showMenu(passwordMenu);
	else
		server.joinGame(rname);
}

function passwordJoin()
{
	var r = $('roomList');
	var rname = r.options[r.selectedIndex].value;
	var pass = passwordField.value;
	server.joinGame(rname,pass);
	menuHandler.closeMenu();
	addMessage('<b>Joining game...</b>');
}

function createGame()
{
	if(myname != '') {
		menuHandler.showMenu(createGameMenu);
	}
}

function hostMPGame()
{
	var v = createGameInputs.getValues();	
	server.hostGame(v[0],v[1]);
}

function Server()
{
	this.states = {
		idle: 0,
		hosting: 1
	}
	
	this.chat = 'chat';
	this.chatInput = 'message';
	
	this.players = new Array();
	this.deadPlayers = new Array();
	
	this.state = this.states.idle;	
	
	var that = this;	
	var impacts = new Array();
	this.ammo = new Array();
	this.syncPositions = false;
	engine.onstop = function()
	{		
		server.sync();
	}

	var positionsReceived = false;
	var impactsReceived = false;
	var healthReceived = false;
	var requireDatas = false;

	this.shoot = function(source,velocity)
	{
		this.req('shoot', {
			a: source,
			p: velocity
		});
	}
	
	this.gotShot = function(e)
	{
		var vecs = e.split(',');
		curPlayer.shoot(vecs[0],vecs[1]);
	}
	
	this.gotWeapons = function(e)
	{		
		that.ammo = e;
		for(var i = 0; i < that.players.length; i++)
		{
			p = that.players[i];
			p.weapons.mininuke.ammo = that.ammo[0];
			p.weapons.bignuke.ammo = that.ammo[1];
			p.weapons.mirv.ammo = that.ammo[2];
			p.weapons.teleport.ammo = that.ammo[3];
			p.weapons.sandeater.ammo = that.ammo[4];
		}
	}
	
	this.nameError = function(e)
	{
		addMessage('<b>' + e + '</b>');
		myname = '';
	}
	
	this.wrongPass = function(e)
	{
		menuHandler.closeMenu();
		addMessage('<b>Wrong password</b>');
	}
	
	this.gotWind = function(e)
	{		
		engine.wind = Number(e);
		windIndicator.value = engine.wind;
		draw();
	}
	
	this.sendHealths = function()
	{
		var str = this.players[0].name + ',' + this.players[0].tank.health;
		for(var i = 1; i < this.players.length; i++)
		{
			str += '|'+this.players[i].name + ',' + this.players[i].tank.health;
		}
		
		this.req('health', {
			hp: str
		});
	}	
	
	this.gotImpacts = function(e)
	{		
		var d = e;
		var pts = new Array();
		var hit = false;
		var pcount = that.players.length;
		for(var i = 0; i < d.length; i++)
		{
			var p = d[i];
			var x = p[0];
			var y = p[1];
			var rad = p[2];
			var dmg = p[3];
			var type = p[4];
			var owner = p[5];
			
			terrain.destroy(new Point(x,y),rad);
			
			if(type=='teleport')
			{
				if(x > 0 && x < canvasW)
				{
					var p = that.findPlayer(owner);
					p.tank.position.x = Number(x);
					p.tank.position.y = Number(y);
					terrain.createPath(ctx);
					engine.addObject(p.tank);
					hit = true;
				}				
				continue;			
			}
			
			for(var i2 = 0; i2 < pcount; i2++)
			{
				var tank = players[i2].tank;						
								
				terrain.createLastHitPath(ctx);
				
				if(ctx.isPointInPath(tank.position.x,tank.position.y))
				{
					engine.addObject(tank);
					tank.health -= dmg;				
					hit = true;			
				}
				else if(tank.checkRadius())
				{
					engine.addObject(tank);
					tank.health -= dmg;
					hit = true;
				}
				else
				{
					tank.createHitbox(ctx);
					if(ctx.isPointInPath(x,y))
					{
						tank.health -= dmg;
						//terrain.removeLastHit();
					}
				}
			}					
		}
		draw();		
		
		if(hit)
		{
			if(!engine.running)
				engine.start();
		}
		
		impactsReceived = true;
		that.sync();		
	}
	
	this.weaponChanged = function(e)
	{
		var d = e.split(',');
		var p = that.findPlayer(d[0]);
		if(p != null)
			p.changeWeapon(d[1]);
	}
	
	this.findPlayer = function(name)
	{
		for(var i = 0; i < this.players.length; i++)
		{
			if(players[i].name == name)
				return players[i];
		}
		return null;
	}
	
	this.findDeadPlayer = function(name)
	{
		for(var i = 0; i < this.deadPlayers.length; i++)
		{
			if(deadPlayers[i].name == name)
				return deadPlayers[i];
		}
		return null;
	}
	
	this.leave = function()
	{
		gameState = states.wait;
		this.req('leavegame');
	}
	
	this.syncHit = function(hit)
	{
		this.req('hit', {
			x: hit.x,
			y: hit.y
		});
	}
	
	this.sendMap = function()
	{
		var points = terrain.getPoints();
		var data = '';
		for(var i = 0, l = points.length; i < l; i++)
		{
			var p = points[i];
			data += p.x;
			data += ',';
			data += p.y;
			data += '|';
		}
		data = data.substr(0,(data.length-1));
		this.req('map', {
			points: data
		});
	}
	
	this.hostGame = function(players,password)
	{
		//this.state = this.states.hosting;
		
		if(password)
			this.req('hostgame', {
				pc: players,
				pw: password
			});
		else
			this.req('hostgame', {
				pc: players
			});
		
	}
	
	this.joinGame = function(name,pass)
	{
		if(!pass)
			this.req('joingame', {
				name: name
			});
		else
			this.req('joingame', {
				name: name,
				password: pass
			});
	}
	
	this.startGame = function(e)
	{			
		var positions = '';
		
		for(var i = 0; i < that.players.length; i++)
		{			
			var tp = new Point(Random(10,canvasW-10),0);			
			positions += tp.x+','+tp.y+'|';
			
			var waste = '';
			for(var sleep = 0; sleep < 1000; sleep++)
			{
				waste += sleep;
				//Waste some time to make random more random
			}			
		}
		
		positions = positions.substr(0,(positions.length-1));
		
		that.req('placetanks', {
			points: positions
		});
	}
	
	this.turnDone = function()
	{
		this.req('turndone');
	}
	
	this.changeWeapon = function(name)
	{
		this.req('changeweapon', {
			n: name
		});
	}
	
	this.gameJoined = function(names)
	{
		//Hide lobby
		menuHandler.getOpenMenu().hide();
		
		that.players = new Array();
		that.deadPlayers = new Array();
		players = that.players;
		deadPlayers = that.deadPlayers;
	
		requireDatas = false;
		
		for(var i = 0; i < names.length; i++)
		{
			var plr;
			if(names[i] == myname)
			{
				plr = new HumanPlayer(myname);
				plr.weapons.mininuke.ammo = that.ammo[0];
				plr.weapons.bignuke.ammo = that.ammo[1];
				plr.weapons.mirv.ammo = that.ammo[2];
				plr.weapons.teleport.ammo = that.ammo[3];
				plr.weapons.sandeater.ammo = that.ammo[4];				
			}
			else 
				plr = new NetworkPlayer(names[i]);
			that.players.push(plr);
		}

		that.displayGameChat();
	}
	
	this.gotMap = function(e)
	{		
		var points = e;
		var p = new Array();
		for(var i = 0; i < points.length; i++)
		{			
			var xy = points[i].split(',');	
			p.push(new Point(xy[0],xy[1]));
		}
		terrain = new Terrain(p);
		terrain.draw(ctx);
	}
	
	this.gotTanks = function(e)
	{	
		var points = e;
		var ammo = ammoInputList.getValues();
		
		for(var i = 0; i < points.length; i++)
		{
			var xy = points[i].split(',');
			var p = new Point(xy[0],xy[1]);
			var tank = new Tank(p);
			that.players[i].setTank(tank);
		}
		
		players = new Array();
		players = that.players;
		deadPlayers = new Array();
		deadPlayers = that.deadPlayers;
		draw();
		that.sync();
	}
	
	this.addImpact = function(x,y,radius,damage,type,owner)
	{		
		if(!type)
			type = 'normal';
					
		var i = {
			x: x,
			y: y,
			radius: radius,
			damage: damage,
			type: type,
			owner: owner
		}		
		
		impacts.push(i);
	}
	
	this.sendImpacts = function()
	{
		var str = '';
		for(var i = 0; i < impacts.length; i++)
		{
			var imp = impacts[i];
			str += imp.x+',';
			str += imp.y+',';
			str += imp.radius+',';
			str += imp.damage+',';
			str += imp.type+',';
			str += imp.owner+'|';
		}
		
		str = str.substr(0,(str.length-1));
		
		this.req('impacts', {
			points: str
		});
	}
	
	this.gotPositions = function(e)
	{		
		var d = e;
		for(var i = 0; i < d.length; i++)
		{
			var pts = d[i].split(',');
			var p = that.findPlayer(pts[0]);
			p.tank.position.x = Number(pts[1]);
			p.tank.position.y = Number(pts[2]);
		}
		positionsReceived = true;
		that.sync();
	}
	
	this.sendPositions = function()
	{
		var str = this.players[0].name + ',' + this.players[0].tank.position.x + ',' + this.players[0].tank.position.y;
		for(var i = 0; i < this.players.length; i++)
		{
			str += '|'+this.players[i].name + ',' + this.players[i].tank.position.x + ',' + this.players[i].tank.position.y;
		}
		
		this.req('positions', {
			p: str
		});
	}
	
	this.sync = function()
	{		
		if(this.syncPositions)
		{
			this.sendPositions();
			this.syncPositions = false;
		}
		
		if(requireDatas)
		{
			if(positionsReceived && impactsReceived && healthReceived)
				this.req('idle');
		}
		else
			this.req('idle');
	}
	
	this.userJoins = function(e)
	{
		var p = new NetworkPlayer(e);
		that.players.push(p);		
		showMessage(e + ' joins',2000);
	}
	
	this.userLeaves = function(e)
	{
		var p = that.findPlayer(e);
		if(p == null)
		{
			p = that.findDeadPlayer(e);
			if(p != null)
				that.deadPlayers.remove(p);
		}
		else
			that.players.remove(p);
		
		if(p == null)
			opera.postError('Error removing player from game');
		else
		{
			var msg = e + ' left the game';
			var time = 2000;
			
			if(that.players.length == 1)
			{
				msg += '<br>' + that.players[0].name + ' wins!';				
				time = 5000;
				gameState = states.wait;
			}
			
			showMessage(msg,time);
		}
	}
	
	this.gameHosted = function()
	{
		//Close host game dialog
		menuHandler.closeMenu();
		//Hide lobby
		menuHandler.getOpenMenu().hide();
		
		that.players = new Array();
		that.deadPlayers = new Array();
		players = that.players;
		deadPlayers = that.deadPlayers;
		terrain.clean();
		var p = new HumanPlayer(myname);
		that.players.push(p);
		
		that.sendMap();
		that.sendWeapons();
		
		showMessage('Waiting for players',5000);
		
		requireDatas = false;		
		that.displayGameChat();
		
		draw();
	}
	
	this.sendWeapons = function()
	{
		var ammo = ammoInputList.getValues();
		var str = String(ammo[0]);
		for(var i = 1; i < ammo.length; i++)
		{
			str += ','+ammo[i];
		}
		
		this.req('weapons', {
			w: str
		});
	}
	
	var gameChat = null;
	this.displayGameChat = function()
	{
		if(widgetW < 500)
			window.resizeTo(widgetW,widgetH+65);
		else
		{
			window.resizeTo(widgetW,widgetH+25);
			if(gameChat == null)
				document.body.insertBefore(createElement('br','','','clear:both'),$('angleDiv'));	
		}
		
		that.chatInput = 'ingameMessage';
		that.chat = 'ingameChat';
		
		if(gameChat != null)
		{
			gameChat.style.display = 'inline';
			return;
		}
				
		
		var style = 'float:right;padding:0;margin:0;display:inline; width:300px;';				
			
		var d = createElement('div','','',style);
		var chat = createElement('div','ingameChat');
		d.appendChild(chat);
		var msg = createElement('input','ingameMessage','','display: inline; width: 140px;');
		msg.onkeyup = keyUp;
		d.appendChild(msg);
		var btn = createElement('input','','','display:inline; width: 50px;');
		btn.type = 'button';
		btn.value = 'Send';		
		btn.onclick = sendMsg;
		d.appendChild(btn);
	
		var leaveBtn = createElement('input','','','display:inline; width: 50px; margin-left: 10px');
		leaveBtn.type = 'button';
		leaveBtn.value = 'Leave';
		leaveBtn.onclick = that.leaveGame;
		d.appendChild(leaveBtn);
				
		document.body.insertBefore(d,$('angleDiv').previousSibling);		
		
		gameChat = d;		
			
		//document.body.appendChild(leaveBtn);
		//document.body.appendChild(gameChat);
	}
	
	this.leaveGame = function(e)
	{		
		//document.body.removeChild(gameChat);
		gameChat.style.display = 'none';		
		window.resizeTo(widgetW,widgetH);
		gameState = states.wait;
		$('angleDiv').setAttribute('style','left:-100px;top:-100px');
		$('powerDiv').setAttribute('style','left:-100px;top:-100px');
		$(that.chat).innerHTML = '';
		that.chatInput = 'message';
		that.chat = 'chat';					
		that.req('leavegame');		
	}
	
	this.gameLeft = function(e)
	{		
		$(that.chat).innerHTML = '';
		menuHandler.getOpenMenu().show();
		addMessage('<b>Joined lobby</b>');
	}
	
	this.gotHealth = function(e)
	{			
		var d = e;
		
		for(var i = 0; i < d.length; i++)
		{
			var n = d[i].split(',');
			var p = that.findPlayer(n[0]);
			
			p.tank.health = Number(n[1]);			
		}
		healthReceived = true;
		that.sync();
	}
	
	this.startTurn = function(e)
	{						
		for(var i = 0; i < players.length; i++)
		{
			var p = players[i];
			if(p.tank.health <= 0)
			{		
				p.die();
				that.players.remove(p);
				that.deadPlayers.push(p);	
			}
		}
		
		impactsReceived = false;
		positionsReceived = false;
		healthReceived = false;
		
		if(that.players.length == 1)
		{
			//Winner, stop.
			gameState = states.wait;
			showMessage(that.players[0].name +' wins!',5000);
			return;
		}
		
		for(var i = 0; i < players.length; i++)
		{
			if(players[i].name == e)
				curPlayer = players[i];
		}
		impacts = new Array();
		
		
		if(e == myname)
		{
			requireDatas = false;
			engine.changeWind();
			windIndicator.value = engine.wind;
			draw();
			that.req('wind', {
				w: engine.wind
			});
			weaponSelect.select(curPlayer.weaponName);
			$('weaponDisplay').innerHTML = curPlayer.weaponName + ' (' + curPlayer.selectedWeapon.ammo +' left)';
			gameState = states.play;
		}
		else	
			requireDatas = true;
		
		curPlayer.startTurn();		
	}
	
	this.req = function(command,param)
	{
		var message = {
			sid: uid,
			command: command
		};

		if(param) {
			message.param = param;
		}

		dojox.cometd.publish('/tankwar/' + command, param);
	}
}


function sendMsg()
{	
	/*req.onreadystatechange = function()
	{
		if(req.readystate == 4)
			alert(req.responseText);
	}*/
	var msg = $(server.chatInput);
	
	var message = msg.value;	
	if(message=='')
		return;
	
	if(myname != '')
	{
		var message = {
			sid: uid,
			msg: message
		};

		if($('privateMessage').checked)
		{
			var target = $('userList').value;
			if(target == myname)
				return;
				
			message.private = target;
		}

		dojox.cometd.publish('/tankwar/say', message);
	}
	else
	{
		myname = msg.value;		
		dojox.cometd.publish('/tankwar/name', {
			sid: uid,
			name: message
		});
	}


	msg.value = '';
}

function keyUp(e)
{
	if(!e) var e = window.event;
	
	if(e.keyCode == 13)
		sendMsg();
		
}

/**
 * TankWar Online Unite application
 *
 * @author Jani Hartikainen <firstname at codeutopia net>
 */

/**
 * Sanitize html stuff from string
 * @param {String} str
 * @return {String}
 */
function sanitize(str) {
	return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

var webserver, cometd;
window.onload = function () {
    webserver = opera.io.webserver

	cometd = new bayeux.CometdServer();
	cometd.onClientConnect = function(client) {
		client.queueMessage(new bayeux.Message({
			channel: '/tankwar/system',
			data: 'What is your name?'
		}));
	};
	cometd.registerChannel('tankwar', tankwarChannel);

    if (webserver) {
        //the index should display the game
        webserver.addEventListener('_index', gameLoader, false);

		webserver.addEventListener('cometd', cometdHandler, false);
    }

	//this is so that the server sends any queued messages periodically
	setInterval(function() {
		cometd.sendQueuedMessages();
	}, 1000);
}

//Tankwar bayeux channel
var tankwarChannel = new bayeux.Channel();
tankwarChannel._availableGames = [];
tankwarChannel._games = [];
tankwarChannel._handlers = {
	/**
	 * Client sends their name. Should usually be first ajax request
	 */
	name: function(client, message) {
		if(client.name) {
			//If the client already has a name this is an invalid request
			return;
		}

		var name = sanitize(decodeURIComponent(message.data.name));

		//Name must only contain alphanumeric characters, underlines and spaces
		if(name.match(/[^A-Za-z0-9_ ]/)) {
			client.queueMessage(new bayeux.Message({
				channel: '/tankwar/nameerror',
				data: 'Your name contains invalid characters. Try again.'
			}));
			return;
		}

		if(this.findClientByName(name)) {
			client.queueMessage(new bayeux.Message({
				channel: '/tankwar/nameerror',
				data: 'Name already in use. Choose another.'
			}));
			return;
		}

		client.name = name;
		client.queueMessage(new bayeux.Message({
			channel: '/tankwar/system',
			data: 'Message of the Day: Welcome to TankWar on Unite!'
		}));

		this._broadcastRooms();
		
		//All clients are joined to the main lobby by default
		this._lobby.join(client);
	},

	/**
	 * Client sends a chat message
	 */
	say: function(client, message) {
		var msg = sanitize(decodeURIComponent(message.data.msg));
		if(!message.data.private) {
			//Determine the correct room to send the message to
			var room = this.findRoomByClient(client);
			if(!room) {
				opera.postError('Client ' + client.name + ' is not in a room and is chatting');
				return;
			}

			room.broadcast('chat', [client.name, msg]);
		}
		else {
			//This is a private message so send it directly to target
			var target = decodeURIComponent(message.data.private);
			var targetClient = this.findClientByName(target);
			targetClient.queueMessage(new bayeux.Message({
				channel: '/tankwar/chat', 
				data: [client.name + ' (private)', msg]
			}));
			
			//Send also to sender so they see it was actually sent
			client.queueMessage(new bayeux.Message({
				channel: '/tankwar/chat', 
				data: [client.name + ' to ' + targetClient.name + ' (private)', msg]
			}));
		}
	},

	/**
	 * Client hosts a game
	 */
	hostgame: function(client, message) {
		var playerCount = parseInt(message.data.pc);
		var password = '';

		//Sanitize value to allowed range
		if(playerCount < 2 || playerCount > 8) {
			playerCount = 2;
		}

		//If password is sent this game becomes password protected
		if(message.data.pw) {
			password = message.data.pw;
		}

		//When game is created, the client is removed from the lobby and placed into the game
		this._lobby.part(client);

		var game = new TankWarGame(client.name, playerCount, password);
		game.join(client);
		this._availableGames.push(game);
		this._games.push(game);

		client.queueMessage(new bayeux.Message({
			channel: '/tankwar/gamehosted',
			data: 'ok'
		}));
		
		//Send rooms so that people get updated about the new game
		this._broadcastRooms();
	},

	/**
	 * Client joins a game
	 */
	joingame: function(client, message) {
		var gameName = message.data.name;
		var password = '';
		
		//If client sent a password, use it
		if(message.data.password) {
			password = message.data.password;
		}

		//Find correct game by name and password
		for(var i = 0, len = this._availableGames.length; i < len; i++) {
			var game = this._availableGames[i];
			if(game.getName() == gameName && password == game.getPassword()) {
				this._lobby.part(client);
				game.join(client);

				//If game became full, send rooms again to refresh this one out
				if(game.isFull()) {
					this._availableGames.splice(i, 1);
					this._broadcastRooms();
				}

				return;
			}
		}

		//The loop returns if game is found so this should not run if found
		client.queueMessage(new bayeux.Message({
			channel: '/tankwar/wrongpass',
			data: 'error'
		}));
	},

	/**
	 * Client leaves a game
	 */
	leavegame: function(client, request) {
		//Remove client from game and put them back to lobby
		this._removeClientFromRoom(client);
		this._lobby.join(client);
		client.queueMessage(new bayeux.Message({
			channel: '/tankwar/gameleft',
			data: 'ok'
		}));
	},

	/**
	 * The host sent the map data for a new game
	 */
	map: function(client, message) {
		if(!message.data.points) {
			return;
		}

		var pointStr = message.data.points;
		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			var points = pointStr.split(/\|/g);
			game.setMap(points);
		}
	},

	/**
	 * The host sent the allowed weapons for a new game
	 */
	weapons: function(client, message) {
		if(!message.data.w) {
			return;
		}

		var pointStr = message.data.w;
		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			var weapons = pointStr.split(/,/g);
			game.setWeapons(weapons);
		}
	},

	/**
	 * The host placed the player tanks on the map
	 */
	placetanks: function(client, message) {
		if(!message.data.points) {
			return;
		}

		var points = message.data.points;
		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			game.setTanks(points.split(/\|/g));
		}
	},

	/**
	 * Client finished what it was doing and is now waiting
	 */
	idle: function(client, request) {
		var room = this.findRoomByClient(client);
		if(room instanceof TankWarGame) {
			room.setIdle(client);
		}
	},

	/**
	 * Client sent a wind change for a game
	 */
	wind: function(client, message) {
		if(!message.data.w) {
			return;
		}

		var wind = message.data.w;
		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			game.setWind(wind);
		}
	},

	/**
	 * Client changed their weapon in a game
	 */
	changeweapon: function(client, message) {
		if(!message.data.n) {
			return;
		}

		var weapon = message.data.n;
		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			game.changeWeapon(client, weapon);
		}
	},

	/**
	 * Client fired a shot in a game
	 */
	shoot: function(client, message) {
		if(!message.data.a || !message.data.p) {
			return;
		}

		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			var a = message.data.a;
			var p = message.data.p;
			game.shoot(client, a, p);
		}
	},

	/**
	 * Client sent impacts from shot
	 */
	impacts: function(client, message) {
		if(!message.data.points) {
			return;
		}

		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			var impactData = message.data.points.split(/\|/g);
			var impacts = impactData.map(function(impact) {
				return impact.split(/,/g);
			});
			game.syncImpactsFromClient(client, impacts);
		}
	},

	/**
	 * Client sent healths after shot
	 */
	health: function(client, message) {
		if(!message.data.hp) {
			return;
		}

		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			var healthData = message.data.hp.split(/\|/g);
			var healths = healthData.map(function(health) {
				var nameHp = health.split(/,/g);
				return { name: nameHp[0], health: nameHp[1] };
			});
			game.syncHealthsFromClient(client, healths);
		}
	},

	positions: function(client, message) {
		if(!message.data.p) {
			return;
		}

		var game = this.findRoomByClient(client);
		if(game instanceof TankWarGame) {
			var positionData = message.data.p.split(/\|/g);
			var positions = positionData.map(function(position) {
				var datas = position.split(/,/g);
				return { name: datas[0], x: datas[1], y: datas[2] };
			});
			game.syncPositionsFromClient(client, positions);
		}
	}
};

tankwarChannel.processMessage = function(connection, message) {
	if(message.getChannel().length < 2) {
		opera.postError('No command');
		return;
	}

	var command = message.getChannel()[1];
	if(!this._handlers[command]) {
		opera.postError('Bad command: ' + command);
		return;
	}

	var client = this.findClient(message.clientId);
	if(!client) {
		opera.postError('No client on tankwar');
		return;
	}

	connection.setResponse(new bayeux.Message({
		channel: message.channel,
		successful: true,
		id: message.id
	}));

	client.addConnection(connection);
	this._handlers[command].call(this, client, message);
	client.flushMessages();
};

tankwarChannel._clientDisconnected = function(client) {
	var room = this.findRoomByClient(client);
	if(room == this._lobby) {
		this._lobby.part(client);
	}
	else {
		this._removeClientFromRoom(client);
	}
};

tankwarChannel._removeClientFromRoom = function(client) {
	var room = this.findRoomByClient(client);
	if(room && room != this._lobby) {
		room.part(client);

		if(room.isEmpty()) {
			var index = this._games.indexOf(room);
			if(index !== -1) {
				this._games.splice(index, 1);
			}

			index = this._availableGames.indexOf(room);
			if(index !== -1) {
				this._availableGames.splice(index, 1);
			}

			this._broadcastRooms();
		}
	}
};

/**
 * Find the room/game where the client is
 * @param {bayeux.Client} client
 * @return {ChatRoom} null if not found
 */
tankwarChannel.findRoomByClient = function(client) {
	if(this._lobby.hasClient(client)) {
		return this._lobby;
	}
	
	for(var i = 0; i < this._games.length; i++) {
		if(this._games[i].hasClient(client)) {
			return this._games[i];
		}
	}

	return null;
};

tankwarChannel.findClient = function(id) {
	for(var i = 0; i < this._subscribers.length; i++) {
		if(this._subscribers[i].getId() == id) {
			return this._subscribers[i];
		}
	}

	return null;
};

tankwarChannel._broadcastRooms = function() {
	var gameNames = this._availableGames.map(function(game){
		if(game.getPassword()) {
			return game.getName() + ',1';
		}
		return game.getName();
	});

	this.publish('rooms', gameNames);
};

tankwarChannel.findClientByName = function(name) {
	for(var i = 0; i < this._subscribers.length; i++) {
		if(this._subscribers[i].name == name) {
			return this._subscribers[i];
		}
	}

	return null;
};

tankwarChannel.publish = function(event, data) {
	var message = new bayeux.Message({
		channel: '/tankwar/' + event,
		data: data
	});

	this._subscribers.forEach(function(c) {
		c.queueMessage(message);
	});
};

tankwarChannel.publishToClient = function(client, event, data) {

};


function cometdHandler(e) {
	var conn = new bayeux.UniteConnection(e.connection);
	cometd.newConnection(conn);
}

function gameLoader(e)
{
    var response = e.connection.response;

	//Redirect out from admin URL as it causes issues
	if(e.connection.isOwner) {
		var url = e.connection.request.host.replace(/admin\./, '');
		url += e.connection.request.uri;

		response.setStatusCode(307);
		response.setResponseHeader('Location', 'http://' + url);
		response.close();
		return;
	}
	var m = new Markuper('templates/tankwar.html');
	m.parse({
		path: webserver.currentServicePath
	});

	response.write(m.html());
    response.close();
}

/**
 * Basic type of chatroom with join/part functionality
 */
var ChatRoom = Class.extend({
	_clients: [],

	init: function() {
		this._clients = [];
	},

	/**
	 * Join a client to the room
	 * @param {SSEClient} client
	 * @return {Boolean} success?
	 */
	join: function(client) {
		this._clients.push(client);
		this.broadcast('join', client.name);
		this._broadcastNames();
		return true;
	},

	/**
	 * Remove client from the room. May fail if client is not in the room
	 * @param {SSEClient} client
	 * @return {Boolean} success?
	 */
	part: function(client) {
		var index = this._clients.indexOf(client);
		if(index === -1) {
			opera.postError('Client not in room');
			return false;
		}

		this._clients.splice(index, 1);
		this.broadcast('part', client.name);
		this._broadcastNames();
		return true;
	},

	/**
	 * Is client in this room?
	 * @param {SSEClient} client
	 * @return {Boolean}
	 */
	hasClient: function(client) {
		return this._clients.indexOf(client) !== -1;
	},

	/**
	 * Send a message to all clients in the room
	 * @param {String} event Event type
	 * @param {String|Array} data Event data
	 */
	broadcast: function(event, data) {
		for(var i = 0, len = this._clients.length; i < len; i++) {
			this._clients[i].queueMessage(new bayeux.Message({
				channel: '/tankwar/' + event, 
				data: data
			}));
		}
	},

	_broadcastNames: function() {
		var names = this._clients.map(function(client) {
			return client.name;
		});

		this.broadcast('names', names);
	}
});

/**
 * A tankwar specific chatroom type which handles gameplay
 */
var TankWarGame = ChatRoom.extend({
	_maxPlayers: 2,
	_name: '',
	_password: '',
	_map: null,
	_weapons: null,
	_tanks: null,
	_currentPlayer: 0,
	_wind: 0,
	_waitForSync: null,
	_waitingList: [],
	_started: false,

	/**
	 * Create TankWarGame room
	 * @param {String} name
	 * @param {Number} maxPlayers Must be between 2 and 8 (inclusive)
	 * @param {String} password Optional
	 */
	init: function(name, maxPlayers, password) {
		this._clients = [];

		if(maxPlayers < 2 || 8 < maxPlayers) {
			maxPlayers = 2;
		}

		this._name = name;
		this._maxPlayers = maxPlayers;
		this._password = password || '';
		this._waitingList = [];
		this._map = [];
		this._weapons = [];
		this._tanks = [];
	},

	isFull: function() {
		return this._clients.length == this._maxPlayers;
	},

	isEmpty: function() {
		return this._clients.length == 0;
	},
	
	getName: function() {
		return this._name;
	},

	getPassword: function() {
		return this._password;
	},

	join: function(client) {
		if(this._clients.length > this._maxPlayers) {
			return false;
		}

		var retval = this._super(client);

		//Initialize dead-indicator to ensure consistency
		client.dead = false;

		client.queueMessage(new bayeux.Message({
			channel: '/tankwar/gamejoined', 
			data: this._clients.map(function(client) {
				return client.name;
			})
		}));

		this.broadcastToAllExcept(client, 'gamejoin', client.name);

		if(this._map.length > 0) {
			client.queueMessage(new bayeux.Message({
				channel: '/tankwar/map',
			    data: this._map
			}));
		}

		if(this._weapons.length > 0) {
			client.queueMessage(new bayeux.Message({
				channel: '/tankwar/weapons',
			    data: this._weapons
			}));
		}

		if(this.isFull()) {
			this._start();
		}

		return retval;
	},

	part: function(client) {
		//If game is in progress and this isn't last player, make sure things stay
		//somewhat sane 
		var changeTurn = false;
		if(this._started && this._clients.length > 1) {
			//If the currently playing client leaves, pass turn to next
			if(this._clients[this._currentPlayer] == client) {
				changeTurn = true;
			}
			
			//Reduce to accomodate leaving player
			this._currentPlayer--;
		}

		this.broadcastToAllExcept(client, 'gameleave', client.name);
		this._super(client);

		//We need to change turn *after* the client has been removed
		if(changeTurn) {
			this._nextTurn();
		}
	},
	
	setWind: function(wind) {
		this._wind = wind;
		this.broadcast('wind', wind);
	},

	setMap: function(points) {
		this._map = points;
	},

	setWeapons: function(weapons) {
		this._weapons = weapons;
	},

	setTanks: function(tanks) {
		this._tanks = tanks;
		this.broadcast('tanks', tanks);

		//Wait for sync and start
		this._waitAndCall('_nextTurn');
	},

	setIdle: function(client) {
		var index = this._waitingList.indexOf(client);
		if(index === -1) {
			return;
		}

		this._waitingList.splice(index, 1);
		if(this._waitingList.length == 0) {
			this[this._waitForSync]();
		}
	},

	changeWeapon: function(client, weapon) {
		var dataStr = client.name + ',' + weapon;
		this.broadcastToAllExcept(client, 'weaponchanged', dataStr);
	},

	shoot: function(client, angle, velocity) {
		var dataStr = [angle, velocity].join(',');
		this.broadcastToAllExcept(client, 'shoot', dataStr);
	},

	syncImpactsFromClient: function(client, impactList) {
		var impactData = impactList.map(function(impact) {
			return impact.join(',');
		});

		this.broadcastToAllExcept(client, 'impacts', impactList);
		this._continueGame('impacts');
	},

	syncHealthsFromClient: function(client, healths) {
		//Client sends healths for living players only
		var livingClientNames = [];

		var healthData = healths.map(function(health) {
			livingClientNames.push(health.name);
			return health.name + ',' + health.health;
		});

		this._clients.forEach(function(client){
			if(livingClientNames.indexOf(client.name) === -1) {
				client.dead = true;
			}
		});

		this.broadcastToAllExcept(client, 'health', healthData);
		this._continueGame('healths');
	},

	syncPositionsFromClient: function(client, positions) {
		var positionData = positions.map(function(position) {
			return position.name + ',' + position.x + ',' + position.y;
		});

		this.broadcastToAllExcept(client, 'positions', positionData);
		this._continueGame('positions');
	},

	broadcastToAllExcept: function(client, event, data) {
		for(var i = 0; i < this._clients.length; i++) {
			if(this._clients[i] !== client) {
				this._clients[i].queueMessage(new bayeux.Message({
					channel: '/tankwar/' + event, 
					data: data
				}));
			}
		}
	},

	_waitAndCall: function(fnc) {
		this._waitingList = this._clients.concat();
		this._waitForSync = fnc;
	},

	_nextTurn: function() {
		this._currentPlayer++;
		if(this._currentPlayer == this._clients.length) {
			this._currentPlayer = 0;
		}

		if(this._clients[this._currentPlayer].dead) {
			this._nextTurn();
		}

		this._beginTurn();
	},

	_beginTurn: function() {
		this._waitForTurnCompletion();
		this.broadcast('turn', this._clients[this._currentPlayer].name);
	},

	_waitForTurnCompletion: function() {
		//These tasks need to be complete (ie. set by handlers here)
		//before a player's turn is complete
		this._turnProgress = {
			healths: false,
			impacts: false,
			positions: false
		};
	},

	_continueGame: function(what) {
		this._turnProgress[what] = true;

		//All turn tasks need to be done before continuing
		for(var task in this._turnProgress) {
			if(!this._turnProgress[task]) {
				return;
			}
		}
		//Turn done. Check victory condition or continue
		var gameOver = this._clients.every(function(client) {
			return client.dead;
		});
		if(gameOver) {
			//Stop turn process
			return;
		}

		this._waitAndCall('_nextTurn');
	},

	_start: function() {
		this._started = true;
		this._clients[0].queueMessage(new bayeux.Message({
			channel: '/tankwar/startgame', 
			data: 'ok'
		}));
		this._currentPlayer = -1;
	}
});

tankwarChannel._lobby = new ChatRoom();

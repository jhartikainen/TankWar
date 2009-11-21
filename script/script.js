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

/**
 * Main tankwar application class
 */
var TankWarApp = SSEApplication.extend({
	/**
	 * Online lobby chat
	 * @type {ChatRoom}
	 */
	_lobby: null,

	/**
	 * List of games
	 * @type {Array}
	 */
	_games: [],

	/**
	 * List of games that aren't full yet
	 * @type {Array}
	 */
	_availableGames: [],

	init: function() {
		this._lobby = new ChatRoom();

		//Initialize games so that it won't become a static variable
		this._games = [];
		this._availableGames = [];
	},

	_handlers: {
		/**
		 * Client sends their name. Should usually be first ajax request
		 */
		name: function(client, request) {
			if(client.name) {
				//If the client already has a name this is an invalid request
				return;
			}

			var name = sanitize(decodeURIComponent(request.queryItems['name'][0]));

			//Name must only contain alphanumeric characters, underlines and spaces
			if(name.match(/[^A-Za-z0-9_ ]/)) {
				client.send('nameerror', 'Your name contains invalid characters. Try again.');
				return;
			}

			if(this.findClientByName(name)) {
				client.send('nameerror', 'Name already in use. Choose another.');
				return;
			}

			client.name = name;
			client.send('system', 'Message of the Day: Welcome to TankWar on Unite!');

			this._broadcastRooms();
			
			//All clients are joined to the main lobby by default
			this._lobby.join(client);
		},

		/**
		 * Client sends a chat message
		 */
		say: function(client, request) {
			var msg = sanitize(decodeURIComponent(request.queryItems['msg'][0]));
			if(!request.queryItems['private']) {
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
				var target = decodeURIComponent(request.queryItems['private'][0]);
				var targetClient = this.findClientByName(target);
				targetClient.send('chat', [client.name + ' (private)', msg]);
				
				//Send also to sender so they see it was actually sent
				client.send('chat', [client.name + ' to ' + targetClient.name + ' (private)', msg]);
			}
		},

		/**
		 * Client hosts a game
		 */
		hostgame: function(client, request) {
			var playerCount = parseInt(decodeURIComponent(request.queryItems['pc'][0]));
			var password = '';

			//Sanitize value to allowed range
			if(playerCount < 2 || playerCount > 8) {
				playerCount = 2;
			}

			//If password is sent this game becomes password protected
			if(request.queryItems['pw'] && request.queryItems['pw'].length == 1) {
				password = decodeURIComponent(request.queryItems['pw'][0]);
			}

			//When game is created, the client is removed from the lobby and placed into the game
			this._lobby.part(client);

			var game = new TankWarGame(client.name, playerCount, password);
			game.join(client);
			this._availableGames.push(game);
			this._games.push(game);

			client.send('gamehosted', 'ok');
			
			//Send rooms so that people get updated about the new game
			this._broadcastRooms();
		},

		/**
		 * Client joins a game
		 */
		joingame: function(client, request) {
			var gameName = decodeURIComponent(request.queryItems['name'][0]);
			var password = '';
			
			//If client sent a password, use it
			if(request.queryItems['password'] && request.queryItems['password'].length == 1) {
				password = decodeURIComponent(request.queryItems['password']);
			}

			//Find correct game by name and password
			for(var i = 0, len = this._availableGames.length; i < len; i++) {
				var game = this._availableGames[i];
				if(game.getName() == gameName && password == game.getPassword()) {
					this._lobby.part(client);
					opera.postError('joining player to game');
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
			client.send('wrongpass', 'error');
		},

		/**
		 * Client leaves a game
		 */
		leavegame: function(client, request) {
			//Remove client from game and put them back to lobby
			this._removeClientFromRoom(client);
			this._lobby.join(client);
			client.send('gameleft', 'ok');
		},

		/**
		 * The host sent the map data for a new game
		 */
		map: function(client, request) {
			if(!request.queryItems['points']) {
				return;
			}

			var pointStr = decodeURIComponent(request.queryItems['points'][0]);
			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				var points = pointStr.split(/\|/g);
				game.setMap(points);
			}
		},

		/**
		 * The host sent the allowed weapons for a new game
		 */
		weapons: function(client, request) {
			if(!request.queryItems['w']) {
				return;
			}

			var pointStr = decodeURIComponent(request.queryItems['w'][0]);
			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				var weapons = pointStr.split(/,/g);
				game.setWeapons(weapons);
			}
		},

		/**
		 * The host placed the player tanks on the map
		 */
		placetanks: function(client, request) {
			if(!request.queryItems['points']) {
				return;
			}

			var points = request.queryItems['points'][0];
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
		wind: function(client, request) {
			if(!request.queryItems['w']) {
				return;
			}

			var wind = request.queryItems['w'][0];
			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				game.setWind(wind);
			}
		},

		/**
		 * Client changed their weapon in a game
		 */
		changeweapon: function(client, request) {
			if(!request.queryItems['n']) {
				return;
			}

			var weapon = request.queryItems['n'][0];
			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				game.changeWeapon(client, weapon);
			}
		},

		/**
		 * Client fired a shot in a game
		 */
		shoot: function(client, request) {
			if(!request.queryItems['a'] || !request.queryItems['p']) {
				return;
			}

			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				var a = request.queryItems['a'][0];
				var p = request.queryItems['p'][0];
				game.shoot(client, a, p);
			}
		},

		/**
		 * Client sent impacts from shot
		 */
		impacts: function(client, request) {
			if(!request.queryItems['points']) {
				return;
			}

			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				var impactData = request.queryItems['points'][0].split(/\|/g);
				var impacts = impactData.map(function(impact) {
					return impact.split(/,/g);
				});
				game.syncImpactsFromClient(client, impacts);
			}
		},

		/**
		 * Client sent healths after shot
		 */
		health: function(client, request) {
			if(!request.queryItems['hp']) {
				return;
			}

			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				var healthData = request.queryItems['hp'][0].split(/\|/g);
				var healths = healthData.map(function(health) {
					var nameHp = health.split(/,/g);
					return { name: nameHp[0], health: nameHp[1] };
				});
				game.syncHealthsFromClient(client, healths);
			}
		},

		positions: function(client, request) {
			if(!request.queryItems['p']) {
				return;
			}

			var game = this.findRoomByClient(client);
			if(game instanceof TankWarGame) {
				var positionData = request.queryItems['p'][0].split(/\|/g);
				var positions = positionData.map(function(position) {
					var datas = position.split(/,/g);
					return { name: datas[0], x: datas[1], y: datas[2] };
				});
				game.syncPositionsFromClient(client, positions);
			}
		}
	},

	_broadcastRooms: function() {
		var gameNames = this._availableGames.map(function(game){
			return game.getName();
		});
		this.broadcast('rooms', gameNames);
	},

	/**
	 * Find the room/game where the client is
	 * @param {SSEClient} client
	 * @return {ChatRoom} null if not found
	 */
	findRoomByClient: function(client) {
		if(this._lobby.hasClient(client)) {
			return this._lobby;
		}
		
		for(var i = 0; i < this._games.length; i++) {
			if(this._games[i].hasClient(client)) {
				return this._games[i];
			}
		}

		return null;
	},

	_clientDisconnected: function(client) {
		var room = this.findRoomByClient(client);
		if(room == this._lobby) {
			this._lobby.part(client);
		}
		else {
			this._removeClientFromRoom(client);
		}
	},

	_removeClientFromRoom: function(client) {
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
	},

	_clientConnected: function(client) {
		client.send('system', 'What is your name?');
	}
});

var webserver;
window.onload = function () {
	opera.postError('plonk');
    webserver = opera.io.webserver
	var app = new TankWarApp();

    if (webserver) {
        //The index should display the game
        webserver.addEventListener('_index', gameLoader, false);

		//This is our SSE Endpoint so we want to make the SSE server handle this
        webserver.addEventListener('sseunite', app.createRequestHandler(), false);

		webserver.addEventListener('cometd', cometdHandler, false);
    }

	//This is so that the server checks if a connection has died and cleans it up
	setInterval(function() {
		app.cleanDeadConnections();	
	}, 30000);
}

var cometd = new bayeux.CometdServer();
function cometdHandler(e) {
	var conn = e.connection;
	var req = conn.request;
	var response = conn.response;

	opera.postError('METHOD: ' + req.method);
	opera.postError('BODY: ' + req.body);
	opera.postError('GET: ');
	for(var k in req.queryItems) {
		opera.postError(k + ': ' + decodeURIComponent(req.queryItems[k][0]));
	}

	opera.postError('POST: ');
	for(var k in req.bodyItems) {
		opera.postError(k + ': ' + decodeURIComponent(req.bodyItems[k][0]));
	}

	if(!req.body) {
		var messages = bayeux.Message.fromJson(decodeURIComponent(req.bodyItems['message'][0]));
	}
	else {
		var body = req.body;
		if(body.indexOf('message=') == 0) {
			body = body.substr(8);
		}
		try {
			var messages = bayeux.Message.fromJson(decodeURIComponent(body));
		}
		catch(ex) {
			opera.postError('JSON parse failed: ');
			opera.postError(body);
		}
	}
	var responseMessage = cometd.processMessage(messages[0]);
	var testMsg = new bayeux.Message({
		channel: '/demo',
		data: 'moi'
	});
	var responseData = '[' + responseMessage.toJson() + ']';
	opera.postError(responseData);

	response.setResponseHeader('Content-Type', 'application/json');
	response.flush();
	response.write(responseData);
	response.flush();
	response.close();
}

function gameLoader(e)
{
    var response = e.connection.response;
	var m = new Markuper('templates/tankwar.html');
	m.parse({
		path: webserver.currentServicePath
	});
	response.write(m.html());
    opera.postError('foo');
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
			this._clients[i].send(event, data);
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

		client.send('gamejoined', this._clients.map(function(client) {
			return client.name;
		}));

		this.broadcastToAllExcept(client, 'gamejoin', client.name);

		if(this._map.length > 0) {
			client.send('map', this._map);
		}

		if(this._weapons.length > 0) {
			client.send('weapons', this._weapons);
		}

		if(this.isFull()) {
			this._start();
		}

		return retval;
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

		opera.postError('sent tanks waiting');
		//Wait for sync and start
		this._waitAndCall('_nextTurn');
	},

	setIdle: function(client) {
		opera.postError(client.name + ' finished');
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
		var healthData = healths.map(function(health) {
			return health.name + ',' + health.health;
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
				this._clients[i].send(event, data);
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
		opera.postError('Progress: ' + what);

		//All turn tasks need to be done before continuing
		for(var task in this._turnProgress) {
			if(!this._turnProgress[task]) {
				return;
			}
		}
		opera.postError('turn should be done');
		this._waitAndCall('_nextTurn');
	},

	_start: function() {
		opera.postError('Starting game');
		this._clients[0].send('startgame', 'ok');
		this._currentPlayer = -1;
	}
});

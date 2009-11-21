if(!window.bayeux) {
	window.bayeux = { };
}

bayeux.Message = function(data) {
	this._data = data;
	for(var key in data) {
		this[key] = data[key];
	}
};

bayeux.Message.prototype = {
	getChannel: function() {
		return this.channel.substr(1).split(/\//g);
	},

	toJson: function() {
		return JSON.stringify(this._data);
	}
};

bayeux.Message.fromJson = function(json) {
	var data = JSON.parse(json);
	var messages = [];
	for(var i = 0; i < data.length; i++) {
		messages.push(new bayeux.Message(data[i]));
	}

	return messages;
};

bayeux.CometdServer = function() {
	this._channels.meta = new bayeux.MetaChannel(this);
};

bayeux.CometdServer.prototype = {
	_channels: {
	},

	_clients: [],

	/**
	 * Process a message
	 * @param {bayeux.Message} message
	 */
	processMessage: function(message) {
		var channel = message.getChannel();

		try {
			var response = this._channels[channel[0]].processMessage(message);
		}
		catch(error) {
			if(error instanceof bayeux.ChannelError) {
				response = new bayeux.Message({
					channel: message.channel,
					successful: false,
					clientId: message.clientId,
					error: this._errorMessageFromCode(error.code, error.data)
				});
			}
			else {
				throw error;
			}
		}
		return response;
	},

	/**
	 * Return client by ID
	 * @return {bayeux.Client}
	 */
	getClient: function(id) {
		var clients = this._clients.filter(function(client){
			return client.getId() == id;
		});

		if(clients.length != 1) {
			return null;
		}

		return clients[0];
	},

	/**
	 * Subscribe a client to a channel
	 * @param {bayeux.Client} client
	 * @param {Array} channel channel definition
	 * @return {Boolean} true if ok, false if channel wasn't found
	 */
	subscribe: function(client, channel) {
		if(!this._channels[channel[0]]) {
			return false;
		}

		this._channels[channel[0]].subscribe(client);
		return true;
	},

	registerClientId: function(id) {
		this._clients.push(new bayeux.Client(id, this));
	},

	disconnect: function(clientId) {
		var client = this.getClient(clientId);
		if(!client) {
			return false;
		}

		this._clients.splice(this._clients.indexOf(client), 1);
		return true;
	},

	clientConnected: function(client) {
		client.setState('connected');
	},

	_errorMessageFromCode: function(code, data) {
		switch(code) {
			case 401:
				return '401::No Client ID';

			case 402:
				return '402:' + data + ':Unknown Client ID';

			case 404:
				return '404:' + data + ':Unknown Channel';

			default:
				//Not per spec. What's the generic error code?
				return '400:' + data + ':Unknown error (' + code + ')';
		}
	}
};

bayeux.Client = function(id, server) {
	this._id = id;
	this._server = server;
};

bayeux.Client.prototype = {
	getId: function() {
		return this._id;
	},

	setState: function(state) {
		this._state = state;
	},

	getState: function() {
		return this._state;
	}
}

bayeux.ChannelError = function(code, data) {
	this.code = code;
	this.data = data || '';
};

bayeux.ChannelError.prototype = Error.prototype;

/**
 * Bayeux protocol /meta channel implementation
 *
 * Known unsupported protocol features:
 * - Subscriptions to multiple channels with single message
 * - Any other protocol than long-polling
 * - Disconnections are always succesful
 *
 * @author Jani Hartikainen <firstname at codeutopia net>
 * @param {bayeux.CometdServer} server
 */
bayeux.MetaChannel = function(server) {
	this._server = server;
};

bayeux.MetaChannel.prototype = {
	_advice: {
		reconnect: 'none'
	},

	processMessage: function(message) {
		var channel = message.getChannel();

		var handler = '_' + channel[1] + 'Handler';
		if(!this[handler]) {
			opera.postError('Meta channel: ' + channel[1]);
			return;
		}

		//All meta channel requests except handshake need client id
		if(channel[1] != 'handshake' && !message.clientId) {
			throw new bayeux.ChannelError(401);
		}
		
		return this[handler](message);
	},
	
	_subscribeHandler: function(message) {
		this._server.getClient(message.clientId);
		if(!client) {
			throw new bayeux.ChannelError(402, message.clientId);
		}

		if(!this._server.subscribe(client, message.subscription)) {
			throw new bayeux.ChannelError(404, message.subscription);
		}

		return new bayeux.Message({
			channel: '/meta/subscribe',
			clientId: message.clientId,
			successful: true,
			subscription: message.subscription
		});
	},

	_connectHandler: function(message) {
		var client = this._server.getClient(message.clientId);
		if(!client) {
			throw new bayeux.ChannelError(402, message.clientId);
		}

		this._server.clientConnected(client);

		return new bayeux.Message({
			channel: '/meta/connect',
			successful: true,
			clientId: message.clientId
		});
	},

	_disconnectHandler: function(message) {
		this._server.disconnect(message.clientId);
		return new bayeux.Message({
			channel: '/meta/disconnect',
			successful: true,
			clientId: message.clientId
		});
	},

	_handshakeHandler: function(message) {
		var spec = {
			channel: '/meta/handshake',
			version: '1.0',
			clientId: this._generateClientId(),
			successful: true,
			supportedConnectionTypes: ['long-polling'],
			advice: this._advice
		};

		if(message.id) {
			spec.id = message.id;
		}

		this._server.registerClientId(spec.clientId);
		return new bayeux.Message(spec);
	},

	_generateClientId: function() {
		var id = '' + (new Date()).getTime();
		id += ''+ Math.random();
		id += ''+ Math.random();
		return id.replace(/\./g, '');
	}
};



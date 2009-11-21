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

		var response = this._channels[channel[0]].processMessage(message);
		return response;
	},

	registerClientId: function(id) {
		this._clients.push(new bayeux.Client(id, this));
	}
};

bayeux.Client = function(id, server) {
	this._id = id;
	this._server = server;
};

bayeux.Client.prototype = {
	getId: function() {
		return this._id;
	}
}

bayeux.MetaChannel = function(server) {
	this._server = server;
};

bayeux.MetaChannel.prototype = {
	_advice: {
		reconnect: 'none'
	},

	processMessage: function(message) {
		var channel = message.getChannel();
		
		switch(channel[1]) {
			case 'handshake':
				return this._processHandshake(message);
				break;
			
			case 'connect':
				return this._processConnect(message);
				break;

			default:
				opera.postError('Meta channel: ' + channel[1]);
		}
	},
	
	_processConnect: function(message) {
		var client = this._server.getClient(message.clientId);
		if(!client) {
			return new bayeux.Message({
				channel: '/meta/connect',
				successful: false,
				clientId: message.clientId,
				error: '402:' + message.clientId + ':Unknown Client ID'
			});
		}

		this._server.clientConnected(client);
	},

	_processHandshake: function(message) {
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



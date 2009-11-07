/**
 * Server-Sent Events application
 *
 * Handles opening new SSE connections and XMLHttpRequests
 * sending data to the server. Extend to provide custom functionality
 *
 * The class is designed so it should not throw errors unless it's obviously
 * a programmer error. This is so that the server should stay somewhat stable.
 *
 * @author Jani Hartikainen <firstname at codeutopia net>
 */
var SSEApplication = Class.extend({
	_clients: [],
	_idCounter: 0,

	/**
	 * List of handler functions for different commands
	 *
	 * Key: command name
	 * Value: handler function(client, request)
	 */
	_handlers: { },

	init: function() {
		this._clients = [];
	},

	/**
	 * Handle a Unite request event. May fail if invalid parameters or other error
	 * @param {WebServerRequestEvent} requestEvent
	 * @throws {Error} if the requestEvent parameter is invalid
	 * @return {Boolean} Success?
	 */
	handleRequest: function(requestEvent) {
		var connection = requestEvent.connection || { };
		var request = connection.request;
		var response = connection.response;

		if(!connection || !request || !response) {
			throw new Error('Invalid WebServerRequestEvent');
		}

		if(!request.queryItems['sid']) {
			this.newClient(connection);
			//Return early since this is a new SSE connection and should not be closed
			return true;
		}
		
		var success = true;

		var client = this.findClient(request.queryItems['sid'][0]);
		if(!client) {
			opera.postError('Invalid SID ' + request.queryItems['sid'][0]);
			success = false;
		}
		else if(!request.queryItems['c']) {
			opera.postError('Invalid request');
			success = false;
		}
		else {
			var command = request.queryItems['c'][0];
			if(!this._handlers[command]) {
				opera.postError('Invalid command ' + command);
				success = false;
			}
			else {
				opera.postError(command);
				success = this._handlers[command].call(this, client, request);
			}
		}

		//Only one return point here because all connections (except new SSE ones) need to be closed
		response.close();
		return success;
	},

	/**
	 * Create a function for handling a request event
	 * @return {Function}
	 */
	createRequestHandler: function() {
		var server = this;
		return function(event) {
			server.handleRequest(event);
		};
	},

	/**
	 * Cleans up connections that have closed
	 */
	cleanDeadConnections: function() {
		//create safe copy of client list
		var clientList = this._clients.concat();
		for(var i = clientList.length - 1; i >= 0; i--) {
			var c = clientList[i];
			var connection = c.getConnection();
			if(!connection || connection.closed) {
				var client = this._clients[i];
				this._clients.splice(i, 1);

				this._clientDisconnected(client);

				opera.postError('Cleaned dead connection');
			}
		}
	},

	newClient: function(connection) {
		var client = new SSEClient(this._idCounter++, connection);
		this._clients.push(client);
		this._clientConnected(client);
		return client;
	},

	findClient: function(id) {
		for(var i = 0, len = this._clients.length; i < len; i++) {
			if(this._clients[i].getId() == id) {
				return this._clients[i];
			}
		}

		return null;
	},

	findClientByName: function(name) {
		for(var i = 0, len = this._clients.length; i < len; i++) {
			if(this._clients[i].name == name) {
				return this._clients[i];
			}
		}

		return null;
	},

	broadcast: function(event, data) {
		for(var i = 0, len = this._clients.length; i < len; i++) {
			this._clients[i].send(event, data);
		}
	},

	/**
	 * Handle a client connection close. Override to provide your own functionality
	 */
	_clientDisconnected: function(client) {
	}
});

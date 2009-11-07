/**
 * Server-Sent Events client
 *
 * Encapsulates the persistent SSE connection
 */
var SSEClient = Class.extend({
	_connection: null,
	_id: '',

	/**
	 * Create new SSEClient
	 * @param {String} id Unique client id
	 * @param {WebServerConnection} connection
	 */
	init: function(id, connection) {
		this._id = id;
		this._connection = connection;

		//Set required SSE headers etc.
		var response = connection.response;
		response.setResponseHeader('Content-Type', 'application/x-dom-event-stream');
		response.setResponseHeader('Connection', 'Close');
		response.setResponseHeader('Cache-Control', 'no-cache, must-revalidate');

		this.send('session-id', id);
		response.flush();
	},

	/**
	 * Get client's persistent connection
	 * @return {WebServerConnection}
	 */
	getConnection: function() {
		return this._connection;
	},

	/**
	 * Return client's unique id
	 * @return {String}
	 */
	getId: function() {
		return this._id;
	},

	/**
	 * Send an event to the client. May fail if client's connection was unexpectedly closed
	 * @param {String} event Event type
	 * @param {String|Array} data Event data
	 * @return {Boolean} success
	 */
	send: function(event, data) {
		if(data === undefined) {
			throw new Error('Data is not defined');
		}

		if(!this._connection) {
			opera.postError('Connection ' + this._id + '/' + this.name + ' died');
			return false;
		}

		if(!this._connection.response) {
			opera.postError('Response (' + this._connection.closed + ') ' + this._id + '/' + this.name + ' died');
			this._connection = null;
			return false;
		}

		if(typeof data != 'string' && data.length) {
			var dataStr = '';
			for(var i = 0, len = data.length; i < len; i++) {
				dataStr += 'data: ' + data[i] + '\n';
			}

			this._connection.response.write('Event: ' + event + '\n' + dataStr + '\n\n');
		}
		else {
			this._connection.response.write('Event: ' + event + '\ndata: ' + data + '\n\n');
		}
		this._connection.response.flush();
		return true;
	}
});

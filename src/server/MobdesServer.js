var SocketIO = require("socket.io");
var crypto = require("crypto");

module.exports = (function() {
	var _this;

	function MobdesServer(http) {
		console.log("MobdesServer");
		_this = this;
		this.onIOConnection = this.onIOConnection.bind(this);
		this.onHandshake = this.onHandshake.bind(this);
		this.io = SocketIO(http);
		this.channels = [];
		this.sessions = [];
		this.methods = {};
		this.io.on("connection", this.onIOConnection);
	}

	MobdesServer.prototype = {
		onIOConnection: function(socket) {
			this.sessions.push(socket);
			socket.on("handshake", this.onHandshake);
			socket.on("disconnect", this.onDisconnect);
			socket.emit("connected", socket.id);
		},

		onHandshake: function(data) {
			var response = {};
			var socket = this.findSocketById(data.socketId);
			socket.removeListener("handshake", this.onHandshake);

			if(data.device == "desktop") {
				response = this.onHandshakeDesktop(response,socket);
			} else if(data.device == "mobile") {
				response = this.onHandshakeMobile(response, socket,data);
			}
			socket.emit("handshakeResponse", response);
		},

		onHandshakeDesktop: function(response, socket) {
			var roomId;
			do {
				roomId = crypto.randomBytes(2).toString("hex");
			} while(this.channels.indexOf(roomId) > -1);

			this.channels.push(roomId);
			socket.join(roomId);
			response.roomId = roomId;
			response.success = true;
			return response;
		},

		onHandshakeMobile: function(response,socket,data) {
			if(data.roomId != undefined && this.channels.indexOf(data.roomId) > -1) {
				socket.join(data.roomId);
				response.success = true;
			} else {
				response.success = false;
			}
			return response;
		},

		onDisconnect: function() {
			var socketId = this.id;
			var socket = _this.findSocketById(socketId);
			socket.removeListener("handshake", _this.onHandshake);
			socket.removeListener("disconnect", _this.onDisconnect);
		},

		// Utils
		findSocketById: function(id) {
			for(var i = 0; i < this.sessions.length; i++) {
				if(this.sessions[i].id == id) {
					return this.sessions[i];
				}
			}
			return null;
		}
	};

	return MobdesServer;
})();
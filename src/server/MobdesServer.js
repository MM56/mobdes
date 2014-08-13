var SocketIO = require("socket.io");
var crypto = require("crypto");

module.exports = (function() {

	function MobdesServer(http) {
		console.log("MobdesServer");

		this.onIOConnection = this.onIOConnection.bind(this);
		this.onHandshake = this.onHandshake.bind(this);
		this.onDisconnect = this.onDisconnect.bind(this);

		this.io = SocketIO(http);
		this.roomIds = [];
		this.sockets = [];
		this.io.on("connection", this.onIOConnection);
	}

	MobdesServer.prototype = {
		onIOConnection: function(socket) {
			console.log("onIOConnection");

			this.sockets.push(socket);

			socket.on("handshake", this.onHandshake);
			socket.on("disconnect", this.onDisconnect);

			socket.emit("connected", socket.id);
		},

		onHandshake: function(data) {
			console.log("onHandshake");
			var response = {};
			var socket = this.findSocketById(data.socketId);
			socket.off("handshake", this.onHandshake);

			if(data.device == "desktop") {
				// room creation
				var roomId;
				do {
					roomId = crypto.randomBytes(2).toString("hex");
				} while(this.roomIds.indexOf(roomId) > -1);

				this.roomIds.push(roomId);
				socket.join(roomId);

				response.roomId = roomId;
				response.success = true;
			} else if(data.device == "mobile") {
				if(data.roomId != undefined && this.roomIds.indexOf(data.roomId) > -1) {
					socket.join(data.roomId);
					response.success = true;
				} else {
					response.success = false;
				}
			}
			socket.emit("handshakeResponse", response);
		},

		onDisconnect: function(a) {
			console.log("onDisconnect");
			// var rooms = socket.rooms.slice(1);

			// console.log("user disconnected", a, rooms);
		},

		// Utils
		findSocketById: function(id) {
			for(var i = 0; i < this.sockets.length; i++) {
				if(this.sockets[i].id == id) {
					return this.sockets[i];
				}
			}
			return null;
		}
	};

	return MobdesServer;
})();
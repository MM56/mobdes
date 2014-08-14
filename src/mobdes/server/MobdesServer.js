var SocketIO = require("socket.io");
var Channel = require(__dirname + "/models/Channel");

module.exports = (function() {
	var _this;

	function MobdesServer(http) {
		console.log("MobdesServer");
		_this = this;
		this.io = SocketIO(http);
		this.channels = [];
		this.io.on("connection", this.onIOConnection);
	}

	MobdesServer.prototype = {
		onIOConnection: function(socket) {
			socket.on("handshake", _this.onHandshake);
			socket.on("disconnect", _this.onDisconnect);
			socket.emit("connected", socket.id);
		},

		onHandshake: function(data) {
			var response = {};
			this.removeListener("handshake", _this.onHandshake);

			if(data.device == "desktop") {
				response = _this.onHandshakeDesktop(response, this);
			} else if(data.device == "mobile") {
				response = _this.onHandshakeMobile(response, this, data);
			}
			this.emit("handshakeResponse", response);
		},

		onHandshakeDesktop: function(response, socket) {
			var roomId = Channel.getUniqueId(this.channels);

			var channel = new Channel(roomId);
			channel.add("desktop", socket);
			this.channels.push(channel);
			console.log("add", this.channels);

			response.roomId = roomId;
			response.success = true;
			return response;
		},

		onHandshakeMobile: function(response, socket, data) {
			var channel = this.findChannelById(data.roomId);
			if(data.roomId != undefined && channel != null) {
				channel.add("mobile", socket);

				response.success = true;
			} else {
				response.success = false;
			}
			return response;
		},

		onDisconnect: function() {
			_this.removeSocketListeners(this);

			var channel = _this.findChannelBySocket(this);
			if(channel != null) {
				channel.remove(this);

				if(channel.sessions.length == 0) {
					_this.removeChannel(channel);
				} else {
					var hasDesktop = false;
					var hasMobile = false;
					var session;
					for(var i = 0; i < channel.sessions.length; i++) {
						session = channel.sessions[i];
						if(session.type == "mobile") {
							hasMobile = true;
						} else if(session.type == "desktop") {
							hasDesktop = true;
						}
						if(hasMobile && hasDesktop) {
							break;
						}
					}

					if(hasDesktop && !hasMobile) {
						channel.notifyNoMobile();
					} else if(!hasDesktop && hasMobile) {
						channel.notifyNoDesktop();
						_this.removeChannelSessionsListeners(channel);
						channel.removeAll();
						_this.removeChannel(channel);
					}
				}
				console.log("del", _this.channels);
			}
		},

		removeChannelSessionsListeners: function(channel) {
			var nbSessions = channel.sessions.length;
			var session;
			for(var i = 0; i < nbSessions; i++) {
				session = channel.sessions[i];
				this.removeSocketListeners(session.socket);
			}
		},

		removeSocketListeners: function(socket) {
			socket.removeListener("handshake", _this.onHandshake);
			socket.removeListener("disconnect", _this.onDisconnect);
		},

		removeChannel: function(channel) {
			this.channels.splice(this.channels.indexOf(channel), 1);
		},

		findChannelBySocket: function(socket) {
			var channel;
			var nbChannels = this.channels.length;
			for(var i = 0; i < nbChannels; i++) {
				channel = this.channels[i];
				if(channel.findSessionBySocket(socket) != null) {
					return channel;
				}
			}
			return null;
		},

		findChannelById: function(id) {
			var channel;
			var nbChannels = this.channels.length;
			for(var i = 0; i < nbChannels; i++) {
				channel = this.channels[i];
				if(channel.id == id) {
					return channel;
				}
			}
			return null;
		}
	};

	return MobdesServer;
})();
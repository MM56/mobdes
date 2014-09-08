var path = require("path");
var Session = require(__dirname + "/Session");
var Message = require(path.resolve(__dirname + "/../../common/") + "/Message");

module.exports = (function() {

	function Channel(id) {
		this.id = id;
		this.sessions = [];
	}

	Channel.instances = [];

	Channel.findInstanceBySocket = function(socket) {
		for(var i = 0; i < Channel.instances.length; i++) {
			var channel = Channel.instances[i];
			for(var j = 0; j < channel.sessions.length; j++) {
				if(channel.sessions[i].socket == socket) {
					return channel;
				}
			}
		}
		return null;
	}

	Channel.prototype = {
		add: function(type, socket) {
			console.log(this.id, socket.id);
			var session = new Session(type, socket);
			this.sessions.push(session);
			socket.join(this.id);
			socket.on(Message.YO, this.onYo);
		},

		remove: function(socket) {
			socket.removeListener(Message.YO, this.onYo);
			var session = this.findSessionBySocket(socket);
			this.sessions.splice(this.sessions.indexOf(session), 1);
		},

		removeAll: function() {
			var socket;
			for(var i = 0; i < this.sessions.length; i++) {
				socket = this.sessions[i].socket;
				socket.removeListener(Message.YO, this.onYo);
				socket.disconnect();
			}
			this.sessions = [];
		},

		onYo: function(yo) {
			var channel = Channel.findInstanceBySocket(this);
			var session = channel.findSessionBySocket(this);
			var type;
			if(session.type == "desktop") {
				type = "mobile";
			} else if(session.type == "mobile") {
				type = "desktop";
			}
			channel.notifyYo(type, yo);
		},

		notifyNoDesktop: function() {
			this.notify(Message.NO_DESKTOP);
		},

		notifyNoMobile: function() {
			this.notify(Message.NO_MOBILE);
		},

		notifyYo: function(type, yo) {
			var session;
			for(var i = 0; i < this.sessions.length; i++) {
				session = this.sessions[i];
				if(session.type == type) {
					session.socket.emit(Message.YO, yo);
				}
			}
		},

		notifyConnexion: function(socket, type) {
			var session;
			var message = type == "desktop" ? Message.DESKTOP_CONNECTED : Message.MOBILE_CONNECTED;
			for(var i = 0; i < this.sessions.length; i++) {
				session = this.sessions[i];
				if(session.socket == socket) {
					continue;
				}
				session.socket.emit(message);
			}
		},

		notify: function(message) {
			for(var i = 0; i < this.sessions.length; i++) {
				this.sessions[i].socket.emit(message);
			}
		},

		findSessionById: function(id) {
			for(var i = 0; i < this.sessions.length; i++) {
				if(this.sessions[i].id == id) {
					return this.sessions[i];
				}
			}
			return null;
		},

		findSessionBySocket: function(socket) {
			for(var i = 0; i < this.sessions.length; i++) {
				if(this.sessions[i].socket == socket) {
					return this.sessions[i];
				}
			}
			return null;
		},

		getNbMobile: function() {
			return this.getNbDevice("mobile");
		},

		getNbDesktop: function() {
			return this.getNbDevice("desktop");
		},

		getNbDevice: function(type) {
			var nbSessions = 0;
			for(var i = 0; i < this.sessions.length; i++) {
				if(this.sessions[i].type == type) {
					nbSessions++;
				}
			}
			return nbSessions;
		}
	};

	Channel.getUniqueId = function(channels) {
		var roomId;
		var str = "abcdefghjkmnpqrstuvwxyz23456789";
		var strLength = 4;
		var i;
		do {
			roomId = "";
			for(i = 0; i < strLength; i++) {
				roomId += str[Math.floor(Math.random() * str.length)];
			}
		} while(channels.indexOf(roomId) > -1);
		return roomId;
	};

	return Channel;
})();
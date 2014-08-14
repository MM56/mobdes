var MobdesClient = (function() {

	function MobdesClient() {
		console.log("MobdesClient");
		this.onConnected = this.onConnected.bind(this);
		this.onHandShakeResponse = this.onHandShakeResponse.bind(this);
	}

	MobdesClient.prototype = {
		device: null,
		roomId: null,
		socket: null,
		socketId: null,

		connect: function(device, roomId) {
			console.log("connect");
			this.device = device;
			this.roomId = roomId;
			this.socket = io();
			this.socket.on("connected", this.onConnected);
		},

		onConnected: function(socketId) {
			console.log("onConnected");

			this.socket.off("connected", this.onConnected);
			this.socketId = socketId;
			this.socket.on("handshakeResponse", this.onHandShakeResponse);
			this.socket.emit("handshake", {socketId: this.socketId, device: this.device, roomId: this.roomId});
		},

		onHandShakeResponse: function(response) {
			console.log("handshakeResponse", this);
			this.socket.off("handshakeResponse", this.onHandShakeResponse);
			if(this.device == "desktop") {
				this.roomId = response.roomId;
				console.log("connected to room", this.roomId);
			} else if(this.device == "mobile") {
				if(response.success) {
					console.log("connected to room", this.roomId);
				} else {
					console.log("can't connect to room", this.roomId);
				}
			}
		}
	};

	return MobdesClient;
})();
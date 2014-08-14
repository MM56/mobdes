var MobdesClient = (function() {

	function MobdesClient() {
		console.log("MobdesClient", Message);
		this.onConnected = this.onConnected.bind(this);
		this.onHandShakeResponse = this.onHandShakeResponse.bind(this);
	}

	MobdesClient.prototype = {
		device: null,
		roomId: null,
		socket: null,
		socketId: null,

		connect: function(url, device, roomId) {
			console.log("connect");
			if(url == null) {
				url = "http://127.0.0.1:3000";
			}
			this.device = device;
			this.roomId = roomId;
			this.socket = io(url);
			this.socket.on("connected", this.onConnected);
		},

		send: function(yo) {
			this.socket.emit(Message.YO, yo);
		},

		onConnected: function(socketId) {
			console.log("onConnected");

			this.socket.off("connected", this.onConnected);
			this.socketId = socketId;
			this.socket.on("handshakeResponse", this.onHandShakeResponse);
			this.socket.on(Message.NO_MOBILE, this.onNoMobile);
			this.socket.on(Message.NO_DESKTOP, this.onNoDesktop);
			this.socket.on(Message.YO, this.onYo);
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
		},

		onNoDesktop: function() {
			console.log("onNoDesktop");
		},

		onNoMobile: function() {
			console.log("onNoMobile");
		},

		onYo: function(yo) {
			console.log("onYo", yo);
		}
	};

	return MobdesClient;
})();
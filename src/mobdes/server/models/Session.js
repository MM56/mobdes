module.exports = (function() {
	function Session(type, socket) {
		this.type = type;
		this.socket = socket;
		this.id = socket.id;
	}

	return Session;
})();
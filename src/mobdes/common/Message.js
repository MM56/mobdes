(function () {
	var messages = {
		NO_DESKTOP: "nodesktop",
		NO_MOBILE: "nomobile",
		YO: "yomama",
		DESKTOP_CONNECTED: "desktopconnected",
		MOBILE_CONNECTED: "mobileconnected",
		NO_ROOM_FOUND: "noroomfound",
		MAX_MOBILE_CONNECTIONS_REACHED: "maxmobileconnectionsreached"
	};

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = messages;
	} else {
		window.Message = messages;
	}
})();
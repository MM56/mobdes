(function () {
	var messages = {
		NO_DESKTOP: "nodesktop",
		NO_MOBILE: "nomobile",
		YO: "yomama"
	};

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = messages;
	} else {
		window.Message = messages;
	}
})();
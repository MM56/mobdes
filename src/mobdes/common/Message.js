(function () {
	var messages = {
		NO_DESKTOP: "nodesktop",
		NO_MOBILE: "nomobile"
	};

	if(typeof module !== 'undefined' && module.exports) {
		module.exports = messages;
	} else {
		window.Message = messages;
	}
})();
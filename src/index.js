var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");

app.use(express.static(__dirname + "/"));

app.get(/(mobile)?/, function(req, res){
	var tpl = path.resolve(__dirname + "/tpl/layouts/default.html");
	res.sendFile(tpl);
});

http.listen(3000, function(){
	console.log("listening on *:3000");
});

var MobdesServer = require("./mobdes/server/MobdesServer");
new MobdesServer(http);

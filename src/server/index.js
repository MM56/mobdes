var express = require("express");
var app = express();
var http = require("http").Server(app);

app.use(express.static(__dirname + "/../"));

app.get(/(mobile)?/, function(req, res){
	res.sendfile("templates/layouts/default.html");
});

http.listen(3000, function(){
	console.log("listening on *:3000");
});

var MobdesServer = require("./MobdesServer");
new MobdesServer(http);

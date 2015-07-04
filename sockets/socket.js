﻿var socket = function (server){
	var io = require('socket.io')(server);
	
	io.on('error', function(err){
		throw err;
	});
	
	io.on('connection', function(socket){
		console.log('a user connected');
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	});
	
	return io;
};

module.exports = socket;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var client =  redis.createClient(6379, 'fiftycache.mlscbx.ng.0001.use1.cache.amazonaws.com');

http.listen(3000);

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected');

	client.get('count', function(err, reply) {
	    io.emit('donated', reply);
	});

	client.get('backers', function(err, reply) {
		io.emit('oneMoreBacker', reply);
	})

	socket.on('disconnect', function() {
		console.log('a user disconnected');
	});

	socket.on('oneMoreBacker', function(msg) {
		client.incr('backers', function(err, reply) {
			io.emit('oneMoreBacker', reply);
			console.log(reply);
		});
	});

	socket.on('donated', function(msg) {
		
		client.incrbyfloat('count', 0.5, function(err, reply) {
	        io.emit('donated', reply);
	    });
		
	});

});

client.on('connect', function() {
    console.log('connected');
});
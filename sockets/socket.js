var pool = require('mysql').createPool({
	host	:'localhost',
	user	:'root',
	password:'5dnjfekf!',
	database:'tripmaster',
	connectionLimit:20
});

function bind_socket(socket){
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
	socket.on('message', function(){
		console.log('ok? clicked!');
	});
	socket.on('isValidId', function(id){
		pool.getConnection(function(err, conn){
			var query = conn.query('select count(*) from user_info where id=?', [id]);
			query.on('error', function(err){
				console.log('err', err);
				socket.emit('socketError');
			});
			query.on('result', function(rows){
				console.log('rows', rows);
				if (rows['count(*)'] == 0){
					socket.emit('isValidId', {valid : true});
				}
				else socket.emit('isValidId', {valid: false});
			});
			conn.release();
		});
	});
	socket.on('updateTagList', function(){
		pool.getConnection(function(err, conn){
			var query = conn.query('select name from tag_info', function(err, rows, field){
				if (err){
					console.log('err', err);
					socket.emit('socketError');
				}
				var reslist = [];
				console.log(rows);
				for (var i in rows){
					reslist.push(rows[i].name);
				}
				socket.emit('updateTagList', {list : reslist});
			});
			conn.release();
		});
	});
}

var socket = function (server){
	var io = require('socket.io')(server);
	
	io.on('error', function(err){
		throw err;
	});
	
	io.on('connection', function(socket){
		//setTimeout(function(){ socket.disconnect(); }, 2000);
		console.log('a user connected');
		bind_socket(socket);
	});

	return io;
};

module.exports = socket;

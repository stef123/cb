<<<<<<< HEAD
var io = require('socket.io'),
    express = require('express'),
    MemoryStore = express.session.MemoryStore,
    app = express.createServer(),
    sessionStore = new MemoryStore();
 
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({store: sessionStore
        , secret: 'secret'
        , key: 'express.sid'}));
    app.use(function (req, res) {
        res.end('<h2>Hello, your session id is ' + req.sessionID + '</h2>');
    });
});



app.listen(80);

var sio = io.listen(app);


 
sio.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    console.log('A socket with sessionID ' + hs.sessionID 
        + ' connected!');
    socket.emit('connection', { hello: 'world' });
    // setup an inteval that will keep our session fresh
    var intervalID = setInterval(function () {
        // reload the session (just in case something changed,
        // we don't want to override anything, but the age)
        // reloading will also ensure we keep an up2date copy
        // of the session with our connection.
        hs.session.reload( function () { 
            // "touch" it (resetting maxAge and lastAccess)
            // and save it back again.
            hs.session.touch().save();
        });
    }, 60 * 1000);
    socket.on('disconnect', function () {
        console.log('A socket with sessionID ' + hs.sessionID 
            + ' disconnected!');
        // clear the socket interval to stop refreshing the session
        clearInterval(intervalID);
    });
    
 	socket.on('move', function (movedata) {
    	console.log('TEST: ' + movedata.action);
    	if(movedata.m_top <60){
    
    		movedata.m_top = 60;
    	}
    	io.sockets.emit('move', movedata);
    //socket.broadcast.emit('move', movedata);
  	});
  
   	socket.on('startmove', function (movedata) {
    	console.log('TEST: ' + movedata.action);
    	io.sockets.emit('startmove', movedata);
    	//socket.broadcast.emit('move', movedata);
  	});
  
  	socket.on('timetravel', function (traveldata) {
    	console.log('TEST: ' + traveldata.time);
    	io.sockets.emit('timetravel', traveldata);
    	//socket.broadcast.emit('move', movedata);
  	});
  	socket.on('delete', function (deletedata) {
   		// console.log('TEST: ' + delete.time);
   	 	io.sockets.emit('delete', deletedata);
    	//socket.broadcast.emit('move', movedata);
  	});

 	
});


var parseCookie = require('connect').utils.parseCookie;
 
var Session = require('connect').middleware.session.Session;
sio.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'];
        // save the session store to the data object 
        // (as required by the Session constructor)
        data.sessionStore = sessionStore;
        sessionStore.get(data.sessionID, function (err, session) {
            if (err || !session) {
                accept('Error', false);
            } else {
                // create a session object, passing data as request and our
                // just acquired session data
                data.session = new Session(data, session);
                accept(null, true);
            }
        });
    } else {
       return accept('No cookie transmitted.', false);
    }
=======
/*var http = require('http'),
    ws   = require('./ws.js');

var clients = [];

 console.log('[Log] CloudBoard server started. Version 0.1.3');



ws.createServer(function(websocket) {
  
 
	
  var username;
  
  websocket.on('connect', function(resource) {
    //clients.push(websocket);
    //websocket.write('Welcome to this chat server!');
    //websocket.write('Please input your username:');
     console.log('uppkoppling!');
  });
  
  websocket.on('data', function(data) {
  	console.log(data);
  
    if (!username) {
      username = data.toString();
      websocket.write('Welcome, ' + username + '!');
      
      return;
    }
    
    var feedback = username + ' said: ' + data.toString();
    
    clients.forEach(function(client) {
      client.write(feedback);
    });
  });
  
  websocket.on('close', function() {
    var pos = clients.indexOf(websocket);
    if (pos >= 0) {
      clients.splice(pos, 1);
    }
  });
  
}).listen(4000);*/

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  socket.emit('move', { hello: 'world' });
  
  socket.on('move', function (movedata) {
    console.log('TEST: ' + movedata.action);
    if(movedata.m_top <60){
    
    	movedata.m_top = 60;
    }
    io.sockets.emit('move', movedata);
    //socket.broadcast.emit('move', movedata);
  });
  
   socket.on('startmove', function (movedata) {
    console.log('TEST: ' + movedata.action);
    io.sockets.emit('startmove', movedata);
    //socket.broadcast.emit('move', movedata);
  });
  
  socket.on('timetravel', function (traveldata) {
    console.log('TEST: ' + traveldata.time);
    io.sockets.emit('timetravel', traveldata);
    //socket.broadcast.emit('move', movedata);
  });
  socket.on('delete', function (deletedata) {
   // console.log('TEST: ' + delete.time);
    io.sockets.emit('delete', deletedata);
    //socket.broadcast.emit('move', movedata);
  });
  
>>>>>>> 5a1d8b07f6d349411529a471349f6a94ec1614f3
});
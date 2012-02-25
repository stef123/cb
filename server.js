
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

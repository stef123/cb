var http = require('http');
var url = require('url');
var fs = require('fs');
var sys = require('sys');
var express = require('express');
var expose = require('express-expose');
var io = require('socket.io');
var formattedDatetime;
var resultSet;

var creationDate;


function getDate() {

	var timeNow = new Date();
	var yearNow = timeNow.getFullYear();
	var monthNow = timeNow.getMonth() + 1;
	monthNow = "0" + monthNow;

	if(monthNow.length <= 1){
					
	}
	var dayNow = timeNow.getDate();


	if(dayNow.length==1){

		dayNow= "0" + dayNow;

	}
	var hourNow = timeNow.getHours() +1;
	var minuteNow = timeNow.getMinutes();
	var secondNow = timeNow.getSeconds();
	formattedDatetime = yearNow + "-" + monthNow + "-" + dayNow + " " + hourNow + ":" + minuteNow + ":" + secondNow;
	
	return String(formattedDatetime);
}


formattedDatetime=getDate();



var _mysql = require('mysql');
var mysql = _mysql.createClient({
	user: 'web82404_cb',
	password: 'cb123',
	host: 'mysql.cloudboard.se',
	database: 'web82404_cb'
});

mysql.query('USE web82404_cb');
	mysql.query('SELECT * from tbl_cb WHERE id=\'1\'', function 

		selectCb(err, results, fields) {
	  	
  			if (err) {
  				console.log("ERROR CONNECTING TO DATABASE");
  				throw err;
  				}
  	 		else {
  	 		
  	 			//console.log(fields);
  	 			  	 				
  	 			creationDate=results[0].createdOn;

  	 			//resultSet = results;
  	 		}
	});



var app = express.createServer();

app.configure(function() {

	app.use(express.static(__dirname + '/static'));
	
});

app.set('views', __dirname + '/views');







app.listen(80);

app.get('/', function(req, res) {

	
	mysql.query('USE web82404_cb');
	mysql.query('SELECT * from tbl_cb_objects WHERE creationDatetime <= \'' + formattedDatetime + '\' AND deletionDatetime > \'' + formattedDatetime + '\'', function 

		selectCb(err, results, fields) {
	  	
  			if (err) {
  				console.log("ERROR CONNECTING TO DATABASE");
  				throw err;
  				}
  	 		else {
  	 			//console.log(fields);
  	 			res.render('index.jade', {
  	 				locals: {
  	 					results: results,
  	 					creationDate: creationDate,
  	 					formattedDatetime: formattedDatetime
  	 					
  	 				}
  	 				
  	 			});

  	 			//resultSet = results;
  	 		}
	});

//console.log(resultSet);
		
	//	res.render('index.jade',{locals: {resultSet: resultSet}});

	    console.log('PUTTADE UT INDEX.HTML');

});

console.log('CloudBoard SERVER v 0.2.1 started on cb.no.de');



io.sockets.on('connection', function (socket) {
  
   console.log('WE ARE IN');
    
  socket.on('disconnect', function () {
        console.log('BORTA!!');
        
  });
    
 	socket.on('move', function (movedata) {
    	console.log('MOVE: ' + movedata.action);
    	if(movedata.m_top <60){
    
    		movedata.m_top = 60;
    	}
    io.sockets.emit('move', movedata);
    
  	});
  
  
   	socket.on('move_start', function (movedata) {
    	console.log('MOVE_START: ' + movedata.action);
    	io.sockets.emit('move_start', movedata);
    	  	});
 
 	socket.on('move_stop', function (movedata) {
    	console.log('MOVE_STOP: ' + movedata.action);
    	if(movedata.m_top <60){
    		movedata.m_top = 60;
    	}
    	mysql.query('UPDATE tbl_cb_objects SET coord_y=' + movedata.m_left + ', coord_x=' + movedata.m_top + ', updateDatetime=\'' + getDate() + '\' WHERE id=' + movedata.m_id + '', function
    	
    	selectCb(err, results, fields) {
    		if (err) throw err;	
		});
    	
    	
    	
    io.sockets.emit('move_stop', movedata);
    //socket.broadcast.emit('move', movedata);
  	});
 
  	socket.on('timetravel', function (traveldata) {
    	console.log('TIMETRAVEL: ' + traveldata.time);
    	io.sockets.emit('timetravel', traveldata);
    	//socket.broadcast.emit('move', movedata);
  	});
  	socket.on('delete', function (deletedata) {
   		console.log('DELETE: ' + deletedata.m_id);
   	 	io.sockets.emit('delete', deletedata);
    	
    	mysql.query('UPDATE tbl_cb_objects SET deletionDatetime=\'' + getDate() + '\' WHERE id=' + deletedata.m_id + '', function
    	
    	selectCb(err, results, fields) {
    		if (err) throw err;	
		});
    	
    	
  	});
	socket.on('resize', function (resizedata) {
   		console.log('RESIZE: ' + resizedata.m_id);
   	 	io.sockets.emit('resize', resizedata);
    	
  	});
  	socket.on('resize_stop', function (resizedata) {
   		console.log('RESIZE_STOP: ' + resizedata.m_id);
   	 	//io.sockets.emit('resize_stop', resizedata);

  	
  		mysql.query('UPDATE tbl_cb_objects SET height=' + resizedata.m_height + ', width=' + resizedata.m_width + ', updateDatetime=\'' + getDate() + '\' WHERE id=' + resizedata.m_id + '', function
    	
    	selectCb(err, results, fields) {
    		if (err) throw err;	
		});
  	});
  
});


/*


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
         console.log('our session id is ' + req.sessionID);
    });
   
});


app.listen(80);

 console.log('CloudBoard SERVER v 0.1.5.3 started');


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
    	sio.sockets.emit('move', movedata);
    //socket.broadcast.emit('move', movedata);
  	});
  
   	socket.on('startmove', function (movedata) {
    	console.log('TEST: ' + movedata.action);
    	sio.sockets.emit('startmove', movedata);
    	//socket.broadcast.emit('move', movedata);
  	});
 
 
  	socket.on('timetravel', function (traveldata) {
    	console.log('TEST: ' + traveldata.time);
    	sio.sockets.emit('timetravel', traveldata);
    	//socket.broadcast.emit('move', movedata);
  	});
  	socket.on('delete', function (deletedata) {
   		// console.log('TEST: ' + delete.time);
   	 	sio.sockets.emit('delete', deletedata);
    	//socket.broadcast.emit('move', movedata);
  	});

 	
});
*/

/*var parseCookie = require('connect').utils.parseCookie;
 
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
 });*/

var express = require('express')
	, passport = require('passport')
	, cronJob = require('cron').CronJob
	, site = require('./src/routes/site.js')
    , serverConfig = require('./configs/configs.json')
    , RedisStore = require('connect-redis')(express)
    , path = require('path');
var io = require('socket.io');

app = express();

var ipaddress, port;

var setupVariables = function() {
	ipaddress = serverConfig.ip;
	port = serverConfig.port;
};

var terminator = function(sig) {
	if(typeof sig === "string") {
		process.exit(1);
	}
};

var setupTerminationHandlers = function () {
    //  Process on exit and signals.
    process.on('exit', function () {
        terminator();
    });

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function (element, index, array) {
            process.on(element, function () {
                terminator(element);
            });
        });
};

setupVariables();
setupTerminationHandlers();

app.configure(function () {
    app.use(express.bodyParser()); // get information from html forms
    app.use(express.cookieParser()); // read cookies (needed for auth)
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.session({
    	store: new RedisStore({
    		host: 'localhost',
		    port: 6379,
		    db: 2,
		    pass: 'RedisPASS'
		}),
		secret: 'hamsteristhebestsport111'
    }));

    app.use(function(req, res, next) {
        res.setHeader("Connection", "close");
        return next();
    });
    app.use(express.static(path.join(__dirname, 'public')));

    app.set('view engine', 'ejs'); // set up ejs for templating

    // required for passport
    app.use(passport.initialize());
});

app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

var server = app.listen(port, ipaddress, function() {
	console.log('Server Started at ' + ipaddress + ':' + port);
});

var io = require('socket.io').listen(server);

require('./src/routes.js')(app, io); // load our routes and pass in our app and fully configured passport

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    //logFile.error(req.url + ' 404, Not Found');
});

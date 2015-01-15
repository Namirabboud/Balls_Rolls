//server.js
var express 	= require( 'express' ),
	app 		= express(),
	port		= process.env.PORT || 8080,
	mongoose	= require( 'mongoose' ),
	passport	= require( 'passport' ),
	flash		= require( 'connect-flash' ),
	path 		= require('path');
	
var morgan			= require ( 'morgan' ),
	cookieParser 	= require ( 'cookie-parser' ),
	bodyParser		= require ( 'body-parser' ),
	session			= require ( 'express-session' ),
	sessionStore 	= new session.MemoryStore();

// link socket io
var	server 				= require( 'http' ).Server( app ),
	io 					= require( 'socket.io' )( server );
		
//database
var configDB	= require( './config/database.js' );
mongoose.connect( configDB.uri /*, configDB.options */ );

//var conn = mongoose.connection;

//conn.on( 'error', console.error.bind( console, 'connection error' ) );

//start the app once we have connection
//conn.once( 'open', function(){
require( './config/passport' )( passport ); 

//set up express application
app.use(express.static(path.join(__dirname, 'views')));
app.use( morgan( 'dev' ) );// log every request  to the console
app.use( cookieParser() );// read cookies ( needed for authentication )
app.use( bodyParser.urlencoded({ // get information from html forms
	extended: true
}));
app.use( session( { 
	store: sessionStore,		
	key: 'aladin_1_*&',
	secret: 'menhabbawadabbayaomme',
	saveUninitialized: true,
	resave: true } ) );
app.use( passport.initialize() );
app.use( passport.session() );
app.use( flash() ); //use connect-flash or flash messages stored in session
app.set( 'view engine', 'ejs' ); //set up ejs for templating

//routes
require( './app/routes.js' )( app , passport );

//socket.io
require( './app/socketIo' )( io, cookieParser, sessionStore );

//launch
server.listen( 8000, "127.0.0.1" );
console.log( 'connecting on port' + port );
//});




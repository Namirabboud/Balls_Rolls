// 	app/routes.js
module.exports = function( app, passport ){
	//home page
	app.get( '/', function( req, res ){ 
		res.render( 'index.ejs' );
	});
	
	//login page
	app.get( '/login', function( req, res ){ 
		res.render( 'login.ejs', { message: req.flash( 'loginMessage' ) } );
	});
	
	//sign up form
	app.get( '/signup', function( req, res ){ 
		res.render( 'signup.ejs', { message: req.flash( 'signupMessage' ) } )
	});	

	//the game
	app.get( '/game', isLoggedIn, function( req, res ){ 
		res.render( 'game.ejs',{ 
			user: req.user
		});
	});

	app.get( '/logout', function( req, res ){ 
		req.logout();
		res.redirect( '/' );
	});

 	app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/game',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	app.post( '/login', passport.authenticate( 'local-login',{
		successRedirect: '/game',
		failureRedirect: '/login',
		failureFlash: true
	}));		
};

function isLoggedIn( req, res, next ){
	if( req.isAuthenticated() )
		return next();
	
	res.redirect( '/' );
}

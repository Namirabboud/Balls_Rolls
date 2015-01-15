// config/passport.js
var localStrategy = require( 'passport-local' ).Strategy;

//load up the user model
var User = require( '../app/models/user' );

module.exports = function( passport ){
	
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

	passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
	
	// local signup =======================================
	passport.use('local-signup', new localStrategy({
                 usernameField : 'email',
				 passwordField : 'password',
				 passReqToCallback : true    
	},
	
	function( req, email, password, done ) {
		process.nextTick(function() {
			User.findOne({ 'local.email' :  email }, function(err, user) {
				//if error return the error
				if( err ) return done( err );
				
				if ( user ) {
					return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            	}else{
					var newUser            	= new User();
					newUser.local.email    	= email;
                    newUser.local.password 	= newUser.generateHash(password);
					newUser.local.score		= 0;
				
					newUser.save(function(err) {
						if (err)
							throw err;
						return done(null, newUser);
                	});
				}			
			});	
		});
	}));

	//local login ========================================
	passport.use( 'local-login', new localStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
	
	function( req, email, password, done ){
		User.findOne( { 'local.email': email }, function( err, user ){
			if( err ) return done( err );
			
			if( !user ) return done( null, false, req.flash( 'loginMessage', 'No user found' ) );

			if( !user.validPassword( password ) ){
				return done( null, false, req.flash( 'loginMessage', 'wrong password' ) );
			}
			return done( null, user );	
		});
	} ) );		
	
};

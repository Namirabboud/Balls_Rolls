// app/models/user.js
var mongoose 	= require( 'mongoose' );
var bcrypt		= require( 'bcrypt-nodejs' );

//define the schema for our user model

var userSchema = mongoose.Schema( { 
	local: {
		email		: String,
		password	: String,
		score		: Number,
	},	
});

//generating a hash
userSchema.methods.generateHash = function( password ){
	return bcrypt.hashSync( password, bcrypt.genSaltSync(8), null );
};

//check if the password is valid
userSchema.methods.validPassword = function( password ){
	return bcrypt.compareSync( password, this.local.password );	
};

//expose the modelin the app
module.exports = mongoose.model( 'User', userSchema );



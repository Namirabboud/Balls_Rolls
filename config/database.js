//	config/database.js

//++++++++++++++++++++++++++++ connect with mongolab +++++++++++++++++++++++++++++++
/*var	uriUtil	= require( 'mongodb-uri' ), //used to parse the mongodb URI	
	mongodbUri = 'your mongo db url';



module.exports = {
	'options': { server: { socketOptions: { keepAlive: 1, connectTimoutMS: 30000 } },			    replset: { socketOptions:{ keepAlive: 1, connectTimoutMS: 30000 }}},
	
	'uri': uriUtil.formatMongoose( mongodbUri )
};*/

//++++++++++++++++++++++++++ connect with local mongodb +++++++++++++++++++++++++++
module.exports = {
	'uri': '127.0.0.1/mongoapp' 
}

// This plugin provides user authentication
module.exports = function setup(options, imports, register)
{
    // create new store for users
    var userstore = imports.store.createStore();

    // create some sample user data, this will be removed later
    // we could of course keep the data in a simple array
    var async = require('async');
    var userdata = [
      { id: "john", name : "John Doe", password : "john" },
      { id: "mary", name : "Mary Poppins", password : "mary" },
      { id: "harry", name : "Harry Potter", password : "harry" }
    ];
    async.forEach(userdata,
      // iterator
      function(item, callback){
        userstore.set( item.id, item, callback);
      },
      // final callback
      function(){
        userstore.length(function(err,length){
          console.log("Store now has %s entries.", length);
        });
      }
    );

    // API
    var api = {
      // very simple authentication
      authenticate : function(userid, password, callback){
        userstore.get(userid, function( err, data ){
          // user does not exist
          // you wouldn't usually reveal this
          if( ! data )
          {
            return callback("Unknown user");
          }
          // check password
          if ( data.password == password )
          {
            return callback( null, data.name );
          }
          // authentication failed
          return callback( "Invalid Password" );
        });
      }
    };

    // Listen for authenticate event and return result of authentication to browser
    var io = imports.socket;
    io.on("connection", function(socket){
      socket.on("authenticate",function(data, callback){
        api.authenticate(data.username, data.password, callback);
      });
    });

    // register plugin and provide plugin API
    register(null,{
        users : api
    });
}
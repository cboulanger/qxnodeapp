// This plugin provides minimal access to user data

module.exports = function setup(options, imports, register)
{

    // create new store for users
    var userstore = imports.store.createStore("memory");

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
      function(err){
        if(err) {throw err}
        userstore.length(function(err,length){
          if(err) {throw err}
          console.log("Store now has %s entries.", length);
        });
      }
    );

    // API
    var api = {
      getUserData : function(id, callback){
        userstore.get(id, callback);
      },
      setUserData : function(id, data, callback){
        userstore.set(id, data, callback)
      },
      // very simple authentication
      authenticate : function(userid, password, callback){
        userstore.get(userid, function( err, data ){
          if ( data.password == password ) callback( null, data );
          callback( "Invalid Password" );
        });
      }
    };

    // Listen for authenticate event and return result of authentication to browser
    var socket = imports.socket;
    socket.on("authenticate",function(data, callback){
      api.authenticate(data.username, data.password, function(err, data){
        callback( err, data );
      });
    });

    // register plugin and provide plugin API
    register(null,{
        users : api
    });
}
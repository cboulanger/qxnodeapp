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

  // User management API

  var api = {
    // get userdata. If a property is given as second argument, return just this property
    // the last argument is the callback
    getUserData : function( userid, arg2, arg3  ) {
      var property = arg3 ? arg2 : null;
      var callback = arg3 ? arg3 : arg2;
      userstore.get(userid, function( err, data ){
        if ( data )
        {
          if ( property ) return callback( null, data[property] );
          return callback( null, data );
        }
        return callback( "A user with id '"+userid+"' doesn't exist");
      });
    },
    // password authentication
    authenticate : function(userid, password, callback){
      userstore.get(userid, function( err, data ){
        // check password
        if ( data && data.password == password )
        {
          return callback(null,userid);
        }
        // authentication failed
        return callback( "Invalid username or password" );
      });
    }
  };

  // support of sessions

  // setup socket events
  var io = imports.socket;
  io.on("connection", function(socket){

    // helper functions using the API

    function login( data, callback )
    {
      api.authenticate( data.username, data.password, function(err,userid){
        if (err) return callback(err);
        socket.set("userid", userid, function(){
          console.log("User %s has logged in.", userid);
          // return user data to the client via the callback
          api.getUserData(userid, callback);
        });
      });
    }

    function logout( userid, callback )
    {
      socket.set("userid", null, function(){
        console.log("User %s has logged out.", userid);
        return callback();
      } );
    }

    // wire helpers to events

    socket.on("authenticate",function(data, callback){
      socket.get("userid", function(err,currentUserId){
        if( currentUserId )
        {
          return logout( currentUserId, function(){
            login( data, callback );
          });
        }
        login( data, callback );
      });
    });
    socket.on("logout", logout );
  });

  // register plugin and provide plugin API
  register(null,{
      users : api
  });
}
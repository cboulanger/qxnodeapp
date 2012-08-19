// This plugin provides a very simple in-memory key-value store
// with an asynchronous API
module.exports = function setup(options, imports, register)
{
  // the Store object
  function Store()
  {
    // the data
    var data = {};

    // the number of key-value records
    var length = 0;

    // the exported API: get, set, length
    return {
      get : function( id, callback )
      {
        callback( null, data[id] );
      },
      set : function( id, value, callback )
      {
        if ( typeof data[id] === "undefined" ) length++;
        data[id] = value;
        callback( null );
      },
      length : function( callback )
      {
        callback( null, length );
      }
    };
  }

  // register plugin
  register(null, {
    store: {
      createStore: function() {
        return new Store();
      }
    }
  });
}
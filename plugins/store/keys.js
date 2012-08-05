// This plugin provides a simple in-memory key-value store and exports a
// minimalistic API which can later be extended when a specific database
// has been chosen: https://github.com/visionmedia/keys#api

module.exports = function setup(options, imports, register)
{
    // dependencies
    var keys = require('keys');

    register(null,{
        // API
        store : {
          /**
           * returns an object with the methods get, set, has, length, remove, clear
           * @see https://github.com/visionmedia/keys#api
           * we only need the memory store for now.
           **/
          createStore : function(type){
            switch (type) {
              case "memory":
                return new keys.Memory({ reapInterval: 200 });
              default:
                throw new Error("Store type '"+type+"' not supported");
            }
          }
        }
    });
}
// This plugin gives provides a connect server for the application

// @options is the object in the config.js file for this plugin.
//   @options.port is the port to listen on.
//   @options.host is the host to bind to 
//   @options.root is the directory from which to serve static files
// @imports is the various services that this plugin declared as dependencies
//   This plugin doesn't have any
// @register is a callback function expecting (err, plugin) where plugin is the
// provided services and lifecycle hooks.  This plugin exports "http".

module.exports = function setup(options, imports, register) 
{    
    // dependencies
    var connect = require("connect");
    var assert  = require("assert");
    var path    = require("path");
    
    // options/parameters
    var host = options.host || process.env.IP;
    var port = options.port || process.env.PORT;
    var root = options.root;
    assert(root && typeof root=="string", "You must provide a document root for the http server");
    
    // create server and register with architect when done
    var app = connect()
      .use(connect['static'](root));
    var server = app.listen(port, host, function (err) {
        if (err) return register(err);
        console.log("Connect server listening on http://%s:%s, serving %s", host, port, root);
        register(null, {
            // When a plugin is unloaded, it's onDestruct function will be called if there is one.
            onDestruct: function (callback) {
                server.close(callback);
            },
            // API
            http: { 
                server : server
            }
        });
    });
}
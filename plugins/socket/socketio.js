// This plugin gives provides a socket.io server for the application

// options:
//   options.namespace is the namespace in which to accept messages.
//   options.loglevel

module.exports = function setup(options, imports, register)
{
    // dependencies
    var socketio = require("socket.io");
    var assert   = require("assert");

    // options/parameters
    var namespace = options.namespace;
    assert(namespace && typeof namespace=="string", "You must provide a namespace for the socket.io channels");
    var loglevel  = options.loglevel || 0;

    // attach socket.io server to http server
    var io = socketio.listen(imports.http.server);
    io.set('log level', loglevel);

    register(null,{
        // API
        socket : io.of(namespace)
    });

    console.log("socket.io server attached, namespace '%s', loglevel %s", namespace, loglevel);
}
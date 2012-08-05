/**
 * Module dependencies.
 */

var helpers = require('./helpers'),
    Riak = require('keys').Riak,
    bucket = 'test-keys';

var store = new Riak({bucket: bucket});
helpers.test(exports, store, function() {
    store.client.removeAll(bucket)();
});
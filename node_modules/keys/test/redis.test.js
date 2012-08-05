
/**
 * Module dependencies.
 */

var helpers = require('./helpers'),
    Redis = require('keys').Redis;

var store = new Redis;
helpers.test(exports, store, function(){
    store.client.end();
});
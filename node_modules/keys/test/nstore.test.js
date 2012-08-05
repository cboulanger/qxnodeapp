
/**
 * Module dependencies.
 */

var helpers = require('./helpers'),
    nStore = require('keys').nStore;

var store = new nStore({ path: '/tmp/nstore.db' });
helpers.test(exports, store);
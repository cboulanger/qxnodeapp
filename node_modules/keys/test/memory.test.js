
/**
 * Module dependencies.
 */

var helpers = require('./helpers'),
    Memory = require('keys').Memory;

var store = new Memory;
helpers.test(exports, store);
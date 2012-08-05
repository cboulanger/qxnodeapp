
/*!
 * Keys - Memory
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Buffer = require('buffer').Buffer;

/**
 * Initialize memory store.
 *
 * Options:
 *
 *  - `data`  Object containing pre-defined store data
 *
 * @param {Object} options
 * @api public
 */

var Memory = module.exports = function Memory(options) {
    var self = this;
    options = options || {};
    this.data = options.data || {};
};

/**
 * Set `key` to `val`, then callback `fn(err)`.
 *
 * @param {String} key
 * @param {String} val
 * @param {Function} fn
 * @api public
 */

Memory.prototype.set = function(key, val, fn){
    this.data[key] = val instanceof Buffer
        ? val
        : new Buffer(val);
    fn && fn();
};

/**
 * Get `key`, then callback `fn(err, val)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Memory.prototype.get = function(key, fn){
    fn(null, this.data[key]);
};

/**
 * Remove `key`, then callback `fn(err)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Memory.prototype.remove = function(key, fn){
    delete this.data[key];
    fn && fn();
};

/**
 * Check if `key` exists, callback `fn(err, exists)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Memory.prototype.has = function(key, fn){
    fn(null, this.data.hasOwnProperty(key));
};

/**
 * Fetch number of keys, callback `fn(err, len)`.
 *
 * @param {Function} fn
 * @api public
 */

Memory.prototype.length = function(fn){
    fn(null, Object.keys(this.data).length);
};

/**
 * Clear all keys, then callback `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

Memory.prototype.clear = function(fn){
    this.data = {};
    fn && fn();
};

/**
 * Iterate with `fn(err, val, key)`, then `done()` when finished.
 *
 * @param {Function} fn
 * @param {Function} done
 * @api public
 */

Memory.prototype.each = function(fn, done){
    var keys = Object.keys(this.data);
    for (var i = 0, len = keys.length; i < len; ++i) {
         fn(this.data[keys[i]], keys[i]);
    }
    done && done();
};

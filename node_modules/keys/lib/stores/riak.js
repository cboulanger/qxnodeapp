
/*!
 * Keys - Riak
 * Copyright(c) 2010 Francisco Treacy <francisco.treacy@gmail.com> and TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var riak = require('riak-js');

/**
 * Initialize Riak store.
 *
 * Options:
 *
 *  - `port`  Optional Riak port
 *  - `host`  Optional Riak host
 *  - `bucket`  Required Riak bucket name
 *  - ...     Other options passed to `riak.getClient()`
 *
 * @param {Object} options
 * @api public
 */

var Riak = module.exports = function Riak(options) {
    if (!options || !options.bucket) throw new Error('Options must contain a bucket property.');
    this.bucket = options.bucket;
    if (options.debug === undefined) options.debug = false;
    this.client = riak.getClient(options);
};

/**
 * Set `key` to `val`, then callback `fn(err)`.
 *
 * @param {String} key
 * @param {String} val
 * @param {Function} fn
 * @api public
 */

Riak.prototype.set = function(key, val, fn){
    this.client.save(this.bucket, key, val, fn);
};

/**
 * Get `key`, then callback `fn(err, val)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Riak.prototype.get = function(key, fn){
    this.client.get(this.bucket, key, function(err, data) {
        if (data && !(data instanceof Buffer)) data = new Buffer(data);
        fn(err, data);
    });
};

/**
 * Remove `key`, then callback `fn(err)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Riak.prototype.remove = function(key, fn){
    this.client.remove(this.bucket, key, fn);
};

/**
 * Check if `key` exists, callback `fn(err, exists)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Riak.prototype.has = function(key, fn){
    this.client.head(this.bucket, key, function(err, resp, meta) {
        fn(err, meta.statusCode !== 404);
    });
};

/**
 * Fetch number of keys, callback `fn(err, len)`.
 *
 * @param {Function} fn
 * @api public
 */

Riak.prototype.length = function(fn){
    this.client.count(this.bucket, function(err, count) {
        fn(err, count[0]);
    });
};

/**
 * Clear all keys, then callback `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

Riak.prototype.clear = function(fn){
    var self = this;
    this.client.keys(this.bucket, function(err, keys) {
        for (var i=0; i < keys.length; i++) {
            self.client.remove(this.bucket, keys[i], function(err, resp) {
                if (i === keys.length - 1) fn(err)
            });
        }
    });
};
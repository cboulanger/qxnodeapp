
/*!
 * Keys - Redis
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var redis = require('redis'),
    noop = function(){};

/**
 * Initialize redis store.
 *
 * Options:
 *
 *  - `port`  Optional redis-server port
 *  - `host`  Optional redis-server host
 *  - ...     Other options passed to `redis.createClient()`
 *
 * @param {Object} options
 * @api public
 */

var Redis = module.exports = function Redis(options) {
    options = options || {};
    this.client = new redis.createClient(options.port, options.host, options);
};

/**
 * Set `key` to `val`, then callback `fn(err)`.
 *
 * @param {String} key
 * @param {String} val
 * @param {Function} fn
 * @api public
 */

Redis.prototype.set = function(key, val, fn){
    this.client.set(key, val, fn || noop);
};

/**
 * Get `key`, then callback `fn(err, val)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Redis.prototype.get = function(key, fn){
    this.client.get(key, function(err, buf){
        fn(err, buf);
    });
};

/**
 * Remove `key`, then callback `fn(err)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Redis.prototype.remove = function(key, fn){
    this.client.del(key, fn);
};

/**
 * Check if `key` exists, callback `fn(err, exists)`.
 *
 * @param {String} key
 * @param {Function} fn
 * @api public
 */

Redis.prototype.has = function(key, fn){
    this.client.exists(key, function(err, exists){
        fn(err, !!exists);
    });
};

/**
 * Fetch number of keys, callback `fn(err, len)`.
 *
 * @param {Function} fn
 * @api public
 */

Redis.prototype.length = function(fn){
    this.client.dbsize(fn);
};

/**
 * Clear all keys, then callback `fn(err)`.
 *
 * @param {Function} fn
 * @api public
 */

Redis.prototype.clear = function(fn){
    this.client.flushdb(fn || noop);
};

/**
 * Iterate with `fn(err, val, key)`, then `done()` when finished.
 *
 * @param {Function} fn
 * @param {Function} done
 * @api public
 */

Redis.prototype.each = function(fn, done){
    var self = this;
    this.client.keys('*', function(err, keys){
        self.client.mget(keys, function(err, vals){
            if (err) {
                done && done(err);
            } else {
                for (var i = 0, len = vals.length; i < len; ++i) {
                    fn(vals[i].toString(), keys[i].toString());
                }
                done && done();
            }
        });
    });
};

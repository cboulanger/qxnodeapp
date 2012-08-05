
/*!
 * Keys
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Generate auto-loading getters.
 * 
 * Example:
 * 
 *     keys.Redis
 * 
 */

(function(name){
    exports.__defineGetter__(name, function(){
        return require('./stores/' + name.toLowerCase());
    });
    return arguments.callee;
})('Memory')('Redis')('nStore')('Riak');
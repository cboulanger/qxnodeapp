
/**
 * Module dependencies.
 */

var keys = require('./../lib/keys');

var store = new keys.Memory({ reapInterval: 200 });

store.set('foo', 'bar', function(){
    store.set('bar', 'baz', function(){
        // Iterate
        store.each(function(val, key){
            console.log('%s: %s', key, val);
        }, function(){
            // Length
            store.length(function(err, len){
                console.log('length: %s', len);
                // Clear
                store.clear(function(){
                    // Length
                    store.length(function(err, len){
                        console.log('length after clear: %d', len);
                    });
                });
            });
        });
    });
});
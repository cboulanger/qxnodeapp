
/*!
 * Keys - Test Helpers
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    Buffer = require('buffer').Buffer;

exports.test = function(exports, store, fn) {
    var name = store.constructor.name,
        fn = fn || function(){};

    exports.setup = function(fn){
        store.clear(fn);
    };

    // #set()
    exports[name + '#set()'] = function(assert, done){
        store.set('foo', 'bar', function(err){
            assert.ok(!err, 'error in callback');
            done();
        });
    };
    
    // #set() binary
    exports[name + '#set() binary'] = function(assert, done){
        store.set('bin', new Buffer('foobar'), function(err){
            assert.ok(!err, 'error in callback');
            done();
        });
    };
    
    // #get() binary
    exports[name + '#get() binary'] = function(assert, done){
        store.set('bin-foo', new Buffer('foobar'), function(err){
            store.get('bin-foo', function(err, val){
                assert.ok(val instanceof Buffer, name + '#get() Buffer failed');
                assert.equal('foobar', val.toString('ascii'));
                done();
            });
        });
    };
    
    // #get()
    exports[name + '#get()'] = function(assert, done){
        store.set('name', 'tj', function(err){
            store.get('name', function(err, val){
                assert.ok(val instanceof Buffer, name + '#get() failed');
                assert.equal('tj', val.toString('ascii'));
                done();
            });
        });
    };
    
    // #remove()
    exports[name + '#remove()'] = function(assert, done){
        store.set('name', 'tj', function(err){
            store.remove('name', function(err){
                store.get('name', function(err, name){
                    assert.ok(!name, '#remove() failed');
                    done();
                });
            });
        });
    };
    
    // #has()
    exports[name + ' #has()'] = function(assert, done){
        store.remove('email', function(){
            store.has('email', function(err, exists){
                assert.strictEqual(false, exists, '#has() was not false');
                store.set('email', 'tj@vision-media.ca', function(err){
                    store.has('email', function(err, exists){
                        assert.strictEqual(true, exists, '#has() was not true');
                        done();
                    });
                });
            });
        });
    };
    
    // #length()
    exports[name + ' #length()'] = function(assert, done){
        store.length(function(err, len){
            assert.equal('number', typeof len);
            done();
        });
    };
    
    // #clear()
    exports[name + ' #clear()'] = function(assert, done){
        store.set('foo', 'bar', function(){
            store.clear(function(err){
                store.length(function(err, len){
                    assert.equal(0, len, '#clear() failed, got length of ' + len);

                    // #each()
                    store.set('one', '1', function(){
                        store.set('two', '2', function(){
                            var keys = [],
                                vals = [];
                            store.each(function(val, key){
                                vals.push(val.toString('ascii'));
                                keys.push(key);
                            }, function(err){
                                assert.ok(!err, '#each() done got an error');
                                assert.ok(keys.indexOf('one') >= 0, 'key one missing');
                                assert.ok(keys.indexOf('two') >= 0, 'key two missing');
                                assert.ok(vals.indexOf('1') >= 0, 'val 1 missing');
                                assert.ok(vals.indexOf('2') >= 0, 'val 2 missing');
                                done();
                                fn();
                            });
                        });
                    });

                });
            });
        });
    };
    
    process.addListener('uncaughtException', fn);
};
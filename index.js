/*eslint-disable strict*/
(function( scope,
           factory ){
    /* istanbul ignore next */
    // CommonJS
    if( typeof exports === 'object' ){
        module.exports = factory( require( 'underscore' ) );
    } else if( typeof define === 'function' && define.amd ){
        // Register as an AMD module if available...
        define( [ 'underscore' ], factory );
    } else {
        // Browser globals for the unenlightened...
        scope.WhenThen = factory( scope._ );
        if( scope.Backbone ){
            scope.Backbone.WhenThen = scope.WhenThen;
        }
    }
}( this, function( _ ){
    'use strict';

    function verifyDispatcher( subject ){
        if( !subject || !subject.on || !subject.trigger || !subject.off ){
            throw new Error( 'subject must have `on`, `off` and `trigger` methods, compatible with Backbone.Events' );
        }
        return subject;
    }

    function Builder( root,
                      puppet,
                      events ){
        this._root = root;
        this._puppet = puppet;
        this._original = events;
    }

    _.extend( Builder.prototype, {
        _original: undefined,
        _callbacks: [],
        _current: [],
        _root: undefined,
        _puppet: undefined,
        _unregistered: true,
        _exec: function( args ){
            _.each( this._callbacks, function( callback ){
                callback.apply( null, args );
            } );
            this._reset();
        },
        _registerDependencies: function(){
            if( this._unregistered ){
                this._reset();
                this._unregistered = false;
            }
        },
        _reset: function(){
            _.each( this._original, function( dependency ){
                this._puppet.once( dependency, function(){
                    this._handle( dependency, _.toArray( arguments ) );
                }, this );
            }, this );
            this._current = _.clone( this._original );
        },
        _handle: function( event,
                           args ){
            this._current.splice( this._current.indexOf( event ), 1 );
            if( !this._current.length ){
                this._exec( args );
            }
        },
        _destroy: function(){
            this._puppet.off( null, null, this );
            this._current = undefined;
            this._original = undefined;
            this._callbacks = undefined;
            this.then = this.have = function(){
                throw new Error( '`then` instance destroyed' );
            };
        },
        have: function( puppet ){
            verifyDispatcher( puppet );
            var self = this;
            return {
                then: function(){
                    var mixed = _.flatten( _.toArray( arguments ) );
                    if( mixed.length <= 0 ){
                        throw new TypeError( '`then` requires at least one string or function' );
                    }
                    this._registerDependencies(); // lazy registration, to avoid extra strain due to unfinished configuration
                    var passArgs = (this._original.length === 1);
                    var callbacks = _.map( mixed, function( eventOrCallback ){
                        var callback;
                        var context;
                        var event;
                        if( _.isString( eventOrCallback ) ){
                            callback = puppet.trigger;
                            context = puppet;
                            event = eventOrCallback;
                        } else if( !_.isFunction( eventOrCallback ) ){
                            throw new TypeError( '`then` only accepts (arrays of) strings or functions' );
                        } else {
                            callback = eventOrCallback;
                            context = null;
                        }
                        if( passArgs ){
                            return function(){
                                var args = _.toArray( arguments );
                                event && args.unshift( event );
                                callback.apply( context, args );
                            };
                        }
                        return function(){
                            callback.call( context );
                        };
                    } );
                    this._callbacks = this._callbacks.concat( callbacks );
                    return {
                        when: this._root.when.bind( this._root )
                    };
                }.bind( self )
            };
        },
        then: function(){
            return this.have( this._puppet ).then.apply( this, _.toArray( arguments ) );
        }
    } );

    return function( puppet ){
        verifyDispatcher( puppet );
        var root = {
            _builders: []
        };
        root.when = function(){
            if( arguments.length <= 0 ){
                throw new TypeError( '`when` requires at least one string' );
            }
            var events = _.flatten( _.toArray( arguments ) );
            _.each( events, function( event ){
                if( !_.isString( event ) ){
                    throw new TypeError( '`when` only accepts (arrays of) strings' );
                }
            } );
            var builder = new Builder( root, puppet, events );
            this._builders.push( builder );
            return builder;
        };
        root.destroy = function(){
            _.each( this._builders, function( builder ){
                builder._destroy();
            } );
            this._builders = undefined;
            this.destroy = this.when = function(){
                throw new Error( '`when` instance destroyed' );
            };
        };
        return root;
    };
} ));

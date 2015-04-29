"use strict";

var _ = require( 'underscore' );

function Builder( root,
                  puppet,
                  events ){
    this._root = root;
    this._puppet = puppet;
    this._original = events;
}

_.extend( Builder.prototype, {
    _original             : undefined,
    _callbacks            : [],
    _current              : [],
    _root                 : undefined,
    _puppet               : undefined,
    _unregistered         : true,
    _exec                 : function(){
        _.each( this._callbacks, function( callback ){
            callback.call();
        } );
        this._reset();
    },
    _registerDependencies : function(){
        if( this._unregistered ){
            this._reset();
            this._unregistered = false;
        }
    },
    _reset                : function(){
        _.each( this._original, function( dependency ){
            this._puppet.once( dependency, function(){
                this._handle( dependency );
            }, this );
        }, this );
        this._current = _.clone( this._original );
    },
    _handle               : function( event ){
        this._current.splice( this._current.indexOf( event ), 1 );
        if( !this._current.length ){
            this._exec();
        }
    },
    _destroy : function(){
        this._puppet.off(null, null, this);
        this._current = undefined;
        this._original = undefined;
        this._callbacks = undefined;
        this.then = function(){
            throw new Error('`then` instance destroyed');
        }
    },
    then                  : function(){
        if(arguments.length <= 0){
            throw new TypeError('`then` requires at least one string or function');
        }
        var mixed = _.flatten( _.toArray( arguments ) );
        this._registerDependencies(); // lazy registration, to avoid extra strain due to unfinished configuration
        var puppet = this._puppet;
        var callbacks = _.map( mixed, function( subject ){
            var callback;
            if( _.isString( subject ) ){
                callback = function(){
                    puppet.trigger( subject );
                };
            } else if( !_.isFunction( subject ) ){
                throw new TypeError('`then` only accepts (arrays of) strings or functions');
            }else{
                callback = subject;
            }
            return callback;
        } );
        this._callbacks = this._callbacks.concat( callbacks );
        return {
            when : this._root.when
        };
    }
} );

module.exports = function( puppet ){
    if( !puppet || !puppet.on || !puppet.trigger || !puppet.off ){
        throw new Error( 'subject must have `on`, `off` and `trigger` methods, compatible with Backbone.Events' );
    }
    var root = {
        _builders : []
    };
    root.when = function(){
        if(arguments.length<=0){
            throw new TypeError( '`when` requires at least one string' );
        }
        var events = _.flatten( _.toArray( arguments ) );
        _.each( events, function( event ){
            if( !_.isString( event ) ){
                throw new TypeError( '`when` only accepts (arrays of) strings' );
            }
        } );
        var builder = new Builder( root, puppet, events );
        this._builders.push(builder);
        return builder;
    };
    root.destroy = function(){
        _.each(this._builders, function(builder){
            builder._destroy();
        });
        this._builders = undefined;
        this.destroy = this.when = function(){
            throw new Error('`when` instance destroyed');
        }
    };
    return root;
};

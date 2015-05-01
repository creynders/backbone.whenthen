'use strict';

/* eslint-env mocha */

module.exports = function( subject,
                           name ){

    var _ = require( 'underscore' );
    var expect = require( 'must' );
    var sinon = require( 'sinon' );
    var Backbone = require( 'backbone' );

    describe( '-- events (' + name + ') --', function(){
        describe( 'spec file', function(){
            it( 'should be found', function(){
                expect( true ).to.be.true();
            } );
        } );

        var dispatcher;
        var root;

        beforeEach( function(){
            dispatcher = _.extend( {}, Backbone.Events );
            root = subject( dispatcher );
        } );

        describe( 'a single event dependency', function(){
            var predicate;
            var spy;
            beforeEach( function(){
                predicate = root.when( 'test' );
                spy = sinon.spy();
            } );
            function specs( n ){
                it( 'should execute the callback after triggering the dependency event', function(){
                    dispatcher.trigger( 'test' );
                    expect( spy.callCount ).to.equal( n );
                } );
                it( 'should execute the callback with each trigger of the dependency event', function(){
                    dispatcher.trigger( 'test' );
                    dispatcher.trigger( 'test' );
                    dispatcher.trigger( 'test' );
                    expect( spy.callCount ).to.equal( 3 * n );
                } );
                it( 'should not execute the callback for other events', function(){
                    dispatcher.trigger( 'test:foo' );
                    expect( spy.callCount ).to.equal( 0 );
                } );
                it( 'should pass all parameters to the callback', function(){
                    dispatcher.trigger( 'test', 'foo', 'bar' );
                    _.times( n, function( i ){
                        expect( spy.args[ i ] ).to.eql( [ 'foo', 'bar' ] );
                    } );
                } );
            }

            describe( 'registered to a single `callback', function(){
                beforeEach( function(){
                    predicate.then( spy );
                } );
                specs( 1 );
            } );
            describe( 'registered to a single `event`', function(){
                beforeEach( function(){
                    dispatcher.on( 'event', spy );
                    predicate.then( 'event' );
                } );
                specs( 1 );
            } );
            describe( 'registered to multiple `callback`s', function(){
                beforeEach( function(){
                    predicate.then( spy, spy, spy );
                } );
                specs( 3 );
            } );
            describe( 'registered to multiple `event`s', function(){
                beforeEach( function(){
                    dispatcher.on( 'event', spy );
                    predicate.then( 'event', 'event', 'event' );
                } );
                specs( 3 );
            } );
        } );
        describe( 'multiple event dependencies', function(){
            var predicate;
            var spy;
            beforeEach( function(){
                predicate = root.when( 'test:a', 'test:b' );
                spy = sinon.spy();
            } );

            function specs( n ){
                it( 'should execute the callback(s) after triggering all of the dependency events in order', function(){
                    dispatcher.trigger( 'test:a' );
                    dispatcher.trigger( 'test:b' );
                    expect( spy.callCount ).to.equal( n );
                } );
                it( 'should execute the callback after triggering all of the dependency events out of order', function(){
                    dispatcher.trigger( 'test:b' );
                    dispatcher.trigger( 'test:a' );
                    expect( spy.callCount ).to.equal( n );
                } );
                it( 'should execute the callback after each full sequence of triggering the dependency events', function(){
                    dispatcher.trigger( 'test:a' );
                    dispatcher.trigger( 'test:b' );
                    dispatcher.trigger( 'test:a' );
                    dispatcher.trigger( 'test:b' );
                    expect( spy.callCount ).to.equal( 2 * n );
                } );
                it( 'should _not_ execute the callback after an incorrect sequence of triggering the dependency events', function(){
                    dispatcher.trigger( 'test:a' );
                    dispatcher.trigger( 'test:a' );
                    dispatcher.trigger( 'test:b' );
                    dispatcher.trigger( 'test:b' );
                    expect( spy.callCount ).to.equal( n );
                } );
                it( 'should _not_ pass any parameters to the callback', function(){
                    dispatcher.trigger( 'test:a', 'foo' );
                    dispatcher.trigger( 'test:b', 'bar' );
                    _.times( n, function( i ){
                        expect( spy.args[ i ] ).to.eql( [] );
                    } );
                } );
            }

            describe( 'registered to a single `callback', function(){
                beforeEach( function(){
                    predicate.then( spy );
                } );
                it( 'should _not_ execute the callback after triggering one of the dependency events', function(){
                    dispatcher.trigger( 'test:a' );
                    expect( spy.callCount ).to.equal( 0 );
                } );
                specs( 1 );
            } );
            describe( 'registered to multiple `callback`s', function(){
                beforeEach( function(){
                    predicate.then( spy, spy, spy );
                } );
                specs( 3 );
            } );
        } );
    } );
};

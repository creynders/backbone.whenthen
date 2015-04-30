'use strict';

/* eslint-env mocha */

module.exports = function(subject, name){

    var _ = require( 'underscore' );
    var expect = require( 'must' );
    var sinon = require( 'sinon' );
    var Backbone = require( 'backbone' );

    describe( '-- backbone.whenthen (' + name + ') --', function(){
        describe( 'spec file', function(){
            it( 'should be found', function(){
                expect( true ).to.be.true();
            } );
        } );

        describe( 'module', function(){
            it( 'should be a function', function(){
                expect( subject ).to.be.a.function();
            } );
        } );

        var dispatcher;
        var root;

        beforeEach( function(){
            dispatcher = _.extend( {}, Backbone.Events );
            root = subject( dispatcher );
        } );

        describe( 'API', function(){
            it( 'should throw an error when a non-compatible events instance is passed', function(){
                expect( function(){
                    subject();
                } ).to.throw( /compatible/ );
            } );
            it( 'should return an object exposing a `when` function', function(){
                expect( root.when ).to.be.a.function();
            } );

            describe( '.when()', function(){
                it( 'should throw an error for anything else but (arrays of) strings', function(){
                    expect( function(){
                        root.when();
                    } ).to.throw( /string/ );
                    expect( function(){
                        root.when( {} );
                    } ).to.throw( /string/ );
                    expect( function(){
                        root.when( 9 );
                    } ).to.throw( /string/ );
                    expect( function(){
                        root.when( false );
                    } ).to.throw( /string/ );
                    expect( function(){
                        root.when( 'string' );
                    } ).not.to.throw();
                    expect( function(){
                        root.when( 'string', 'string', 'string' );
                    } ).not.to.throw();
                    expect( function(){
                        root.when( [ 'string', 'string', 'string' ] );
                    } ).not.to.throw();
                    expect( function(){
                        root.when( 'string', [ 'string', 'string' ] );
                    } ).not.to.throw();
                } );
                describe( '.then()', function(){
                    beforeEach( function(){
                        root = root.when( 'test' );
                    } );
                    it( 'should throw for anything else but (arrays of) functions or strings', function(){
                        var f = function(){
                        };
                        expect( function(){
                            root.then();
                        } ).to.throw( /string|function/ );
                        expect( function(){
                            root.then( 9 );
                        } ).to.throw( /string|function/ );
                        expect( function(){
                            root.then( false );
                        } ).to.throw( /string|function/ );
                        expect( function(){
                            root.then( f, 'string' );
                        } ).not.to.throw();
                        expect( function(){
                            root.then( 'string', f, 'string' );
                        } ).not.to.throw();
                        expect( function(){
                            root.then( [ 'string', f, f ] );
                        } ).not.to.throw();
                        expect( function(){
                            root.then( f, [ 'string', f ], 'string' );
                        } ).not.to.throw();
                    } );
                    describe('.when()', function(){
                        it( 'should be a function', function(){
                            expect( root.then( 'string' ).when ).to.be.a.function();
                        } );
                        it('should not throw when used', function(){
                            expect(function(){
                               root.then('string' ).when('string')
                            } ).to.not.throw();
                        })
                    });
                } );
            } );
            describe( '.destroy()', function(){
                it( 'should unregister all callbacks', function(){
                    var spy = sinon.spy();
                    root.when( 'test' ).then( spy );
                    root.destroy();
                    dispatcher.trigger( 'test' );
                    expect( spy.callCount ).to.equal( 0 );
                } );
                it( 'should throw upon reuse', function(){
                    var predicate = root.when('test');
                    root.destroy();
                    expect( function(){
                        root.when('test');
                    } ).to.throw( /destroyed/ );
                    expect( function(){
                        predicate.then('foo');
                    } ).to.throw( /destroyed/ );
                } );
            } );
        } );
        describe( 'functionality:', function(){
            describe( 'a single event dependency', function(){
                var predicate;
                var spy;
                beforeEach( function(){
                    predicate = root.when( 'test' );
                    spy = sinon.spy();
                } );
                describe( 'registered to a single `callback', function(){
                    beforeEach( function(){
                        predicate.then( spy );
                    } );
                    it( 'should execute the callback after triggering the dependency event', function(){
                        dispatcher.trigger( 'test' );
                        expect( spy.callCount ).to.equal( 1 );
                    } );
                    it( 'should execute the callback with each trigger of the dependency event', function(){
                        dispatcher.trigger( 'test' );
                        dispatcher.trigger( 'test' );
                        dispatcher.trigger( 'test' );
                        expect( spy.callCount ).to.equal( 3 );
                    } );
                    it( 'should not execute the callback for other events', function(){
                        dispatcher.trigger( 'test:foo' );
                        expect( spy.callCount ).to.equal( 0 );
                    } );
                    it( 'should pass all parameters to the callback', function(){
                        dispatcher.trigger( 'test', 'foo', 'bar' );
                        expect( spy.calledWithExactly( 'foo', 'bar' ) ).to.be.true();
                    } );
                } );
                describe( 'registered to a single `event`', function(){
                    beforeEach( function(){
                        dispatcher.on( 'event', spy );
                        predicate.then( 'event' );
                    } );
                    it( 'should trigger `event` after triggering the dependency event', function(){
                        dispatcher.trigger( 'test' );
                        expect( spy.callCount ).to.equal( 1 );
                    } );
                    it( 'should trigger `event` with each triggering of the dependency event', function(){
                        dispatcher.trigger( 'test' );
                        dispatcher.trigger( 'test' );
                        dispatcher.trigger( 'test' );
                        expect( spy.callCount ).to.equal( 3 );
                    } );
                    it( 'should not trigger `event` for other events', function(){
                        dispatcher.trigger( 'test:foo' );
                        expect( spy.callCount ).to.equal( 0 );
                    } );
                    it( 'should pass all parameters to the callback', function(){
                        dispatcher.trigger( 'test', 'foo', 'bar' );
                        expect( spy.calledWithExactly( 'foo', 'bar' ) ).to.be.true();
                    } );
                } );
                describe( 'registered to multiple `callback`s', function(){
                    beforeEach( function(){
                        predicate.then( spy, spy, spy );
                    } );
                    it( 'should execute the callbacsk after triggering the dependency event', function(){
                        dispatcher.trigger( 'test' );
                        expect( spy.callCount ).to.equal( 3 );
                    } );
                    it( 'should execute the callback with each triggering of the dependency event', function(){
                        dispatcher.trigger( 'test' );
                        dispatcher.trigger( 'test' );
                        dispatcher.trigger( 'test' );
                        expect( spy.callCount ).to.equal( 9 );
                    } );
                    it( 'should not execute the callback for other events', function(){
                        dispatcher.trigger( 'test:foo' );
                        expect( spy.callCount ).to.equal( 0 );
                    } );
                    it( 'should pass all parameters to all callbacks', function(){
                        dispatcher.trigger( 'test', 'foo', 'bar' );
                        expect( spy.args[ 0 ] ).to.eql( [ 'foo', 'bar' ] );
                        expect( spy.args[ 1 ] ).to.eql( [ 'foo', 'bar' ] );
                        expect( spy.args[ 2 ] ).to.eql( [ 'foo', 'bar' ] );
                    } );
                } );
            } );
            describe( 'multiple event dependencies', function(){
                var predicate;
                var spy;
                beforeEach( function(){
                    predicate = root.when( 'test:a', 'test:b' );
                    spy = sinon.spy();
                } );
                describe( 'registered to a single `callback', function(){
                    beforeEach( function(){
                        predicate.then( spy );
                    } );
                    it( 'should _not_ execute the callback after triggering one of the dependency events', function(){
                        dispatcher.trigger( 'test:a' );
                        expect( spy.callCount ).to.equal( 0 );
                    } );
                    it( 'should execute the callback after triggering all of the dependency events in order', function(){
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:b' );
                        expect( spy.callCount ).to.equal( 1 );
                    } );
                    it( 'should execute the callback after triggering all of the dependency events out of order', function(){
                        dispatcher.trigger( 'test:b' );
                        dispatcher.trigger( 'test:a' );
                        expect( spy.callCount ).to.equal( 1 );
                    } );
                    it( 'should execute the callback after each full sequence of triggering the dependency events', function(){
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:b' );
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:b' );
                        expect( spy.callCount ).to.equal( 2 );
                    } );
                    it( 'should _not_ execute the callback after an incorrect sequence of triggering the dependency events', function(){
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:b' );
                        dispatcher.trigger( 'test:b' );
                        expect( spy.callCount ).to.equal( 1 );
                    } );
                    it( 'should _not_ pass any parameters to the callback', function(){
                        dispatcher.trigger( 'test:a', 'foo' );
                        dispatcher.trigger( 'test:b', 'bar' );
                        expect( spy.calledWithExactly() ).to.be.true();
                    } );
                } );
                describe( 'registered to multiple `callback`s', function(){
                    beforeEach( function(){
                        predicate.then( spy, spy, spy );
                    } );
                    it( 'should execute the callbacks after triggering all of the dependency events', function(){
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:b' );
                        expect( spy.callCount ).to.equal( 3 );
                    } );
                    it( 'should execute the callback with each full sequence of the dependency events', function(){
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:b' );
                        dispatcher.trigger( 'test:a' );
                        dispatcher.trigger( 'test:b' );
                        expect( spy.callCount ).to.equal( 6 );
                    } );
                } );
            } );
            describe( 'when().have().then()', function(){
                var predicate;
                var spy;
                var other;
                beforeEach( function(){
                    predicate = root.when( 'test' );
                    spy = sinon.spy();
                    other = _.extend( {}, Backbone.Events );
                    other.on( 'relayed', spy );
                    predicate.have( other ).then( 'relayed' );
                } );
                it( 'should replace it as dispatcher for `then` events', function(){
                    dispatcher.trigger( 'test' );
                    expect( spy.callCount ).to.equal( 1 );
                } );
            } );
        } );
    } );
};

'use strict';

/* eslint-env mocha */

module.exports = function( subject,
                           name ){

    var _ = require( 'underscore' );
    var expect = require( 'must' );
    var sinon = require( 'sinon' );
    var Backbone = require( 'backbone' );

    describe( '-- API (' + name + ') --', function(){
        describe( 'spec file', function(){
            it( 'should be found', function(){
                expect( true ).to.be.true();
            } );
        } );

        describe( 'module', function(){
            it( 'should be a function', function(){
                expect( subject ).to.be.a.function();
            } );
        } );// module

        var dispatcher;
        var root;

        beforeEach( function(){
            dispatcher = _.extend( {}, Backbone.Events );
            root = subject( dispatcher );
        } );

        describe( '()', function(){
            it( 'should throw an error when a non-compatible events instance is passed', function(){
                expect( function(){
                    subject();
                } ).to.throw( /compatible/ );
            } );
            it( 'should return an object exposing a `when` function', function(){
                expect( root.when ).to.be.a.function();
            } );

            describe( '.when()', function(){
                it( 'should throw an error if no arguments were provided', function(){
                    expect( function(){
                        root.when();
                    } ).to.throw( /argument/ );
                } );
                it( 'should throw an error for anything else but (arrays of) strings', function(){
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
                    describe( '.when()', function(){
                        it( 'should be a function', function(){
                            expect( root.then( 'string' ).when ).to.be.a.function();
                        } );
                        it( 'should not throw when used', function(){
                            expect( function(){
                                root.then( 'string' ).when( 'string' );
                            } ).not.to.throw();
                        } );
                    } );// when().then().when()
                    describe( '.then()', function(){
                        it( 'should be a function', function(){
                            expect( root.then( 'string' ).then ).to.be.a.function();
                        } );
                        it( 'should not throw when used', function(){
                            expect( function(){
                                root.then( 'string' ).then( 'string' );
                            } ).not.to.throw();
                        } );
                    } );// when().then().then()
                } );// when().then()
                describe( '.have()', function(){
                    var predicate;
                    var spy;
                    var other;
                    beforeEach( function(){
                        predicate = root.when( 'test' );
                        spy = sinon.spy();
                        other = _.extend( {}, Backbone.Events );
                        other.on( 'relayed', spy );
                    } );
                    it( 'should be a function', function(){
                        expect( predicate.have ).to.be.a.function();
                    } );
                    it( 'should throw if it doesn\'t receice a Backbone.Events compatible dispatcher', function(){
                        expect( function(){
                            predicate.have();
                        } ).to.throw( /compatible/ );
                    } );
                    it( 'should replace it as dispatcher for `then` events', function(){
                        predicate.have( other ).then( 'relayed' );
                        dispatcher.trigger( 'test' );
                        expect( spy.callCount ).to.equal( 1 );
                    } );
                } );
            } );// when()
            describe( '.destroy()', function(){
                it( 'should unregister all callbacks', function(){
                    var spy = sinon.spy();
                    root.when( 'test' ).then( spy );
                    root.destroy();
                    dispatcher.trigger( 'test' );
                    expect( spy.callCount ).to.equal( 0 );
                } );
                it( 'should throw upon reuse', function(){
                    var predicate = root.when( 'test' );
                    root.destroy();
                    expect( function(){
                        root.when( 'test' );
                    } ).to.throw( /destroyed/ );
                    expect( function(){
                        predicate.then( 'foo' );
                    } ).to.throw( /destroyed/ );
                } );
            } );// destroy()
        } );// API
    } );
};

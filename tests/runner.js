'use strict';

module.exports = function( code,
                           name ){
    require( './api.spec' )( code, name );
    require( './events.spec' )( code, name );
};

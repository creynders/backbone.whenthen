var runner = require('./runner');
runner(require( '../index' ), 'source');
runner(require( '../dist/backbone.whenthen' ), 'beautified');
runner(require( '../dist/backbone.whenthen.min' ), 'minified');

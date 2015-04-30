require('source.test');
var tests = require('./tests');
tests(require( '../dist/backbone.whenthen' ), "beautified");
tests(require( '../dist/backbone.whenthen.min' ), "minified");

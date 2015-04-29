# backbone.whenthen

> when \<events\> then \<execute\>

Honestly, it's easier to show than tell.

```js
//we have a Backbone.Events instance at our disposal in `app.vent`
app.vent.on('rolling', function(){
	console.log('Here we go:');
});

var command = require('backbone.whenthen');
command(app.vent)
    .when('event1', 'event2', 'event3')
    .then('rolling', function(){
        console.log("We're ready to roll!!");
    });

app.vent.trigger('event1'); // nothing happens
app.vent.trigger('event2'); // nothing happens
app.vent.trigger('event3'); 
```
```sh
// output to console: 
Here we go:
We're ready to roll!!
```

This is especially useful in situations where you have a lot of async processes going on at the same time, or in sequence, and you want to respond to the collective completion of these processes.
For instance: complex loading and bootstrapping sequences or bespoke view transitions.

## installation

```sh
# bower
bower install backbone.whenthen
```

```sh
# npm
npm install backbone.whenthen
```

## dependencies

* Despite the name `backbone.whenthen` does _NOT_ have a hard dependency on `Backbone`, however it does expect `Backbone.Events`-compatible instances to control.
* `underscore` _is_ **required** shizzle though. 

## usage

`backbone.whenthen` can be used in node or the browser, either with:

```js
// AMD
define([ "backbone.whenthen" ], function(command){
    //use `command` as in the examples
});
```
```js
// CommonJS
var command = require('backbone.whenthen');
//use `command` as in the examples
```
```html
<!-- old skool, definitely NOT recommended -->
<script src="//jashkenas.github.io/underscore/underscore-min.js"></script> <!-- must be loaded first -->
<script src="//jashkenas.github.io/backbone/backbone-min.js"></script> <!-- must be loaded first -->
<script src="/vendor/backbone.whenthen.min.js"></script>
```
```js
//old skool, continued
var command = Backbone.WhenThen; // it's attached to Backbone
//or in case you don't load Backbone:
var command = WhenThen; // it's a global object... *shudders*

//use `command` as in the examples
```

## API

The `backbone.whenthen` module exposes a function, which accepts a Backbone.Events(-compatible) event dispatcher and starts off an extremely simple fluent interface:

```js
var _ = require('underscore');
var Backbone = require('backbone');
var command = require('backbone.whenthen');
var dispatcher = _.extend({}, Backbone.Events); // obviously any Backbone.Events dispatcher will do: Backbone.Model et cetera.
command(dispatcher);
```

#### `.when({...String|...String[]})`

You can pass as many (arrays of) event strings to `when` as you want, they'll be normalized:

```js
command(dispatcher)
	.when('event:a', ['event:b', 'event:c'], 'event:d');
```

#### `.when().then({...Function|...Function[]|...String|...String[]})`

`then` accepts any number (and mixture) of (arrays of) strings and/or functions:

```js
command(dispatcher)
	.when('event:a', ['event:b', 'event:c'], 'event:d')
	.then('event:z', ['event:y', fooFn], barFn);
```

Once all events registered in `when` have been triggered by `dispatcher`, all items registered with `then` will be either be executed (functions) or triggered (strings) in `dispatcher`. I.e. in the above example `dispatcher` will trigger `event:z`, `event:y` and call `fooFn`, `barFn` (synchronously and in order).

Example:

```js
command(app.vent)
	.when('loaded:images', 'loaded:locales')
	.then('app:show:ui');
```

It doesn't matter in which order the `when` events are triggered, `then` will always wait until all of them have been triggered.

#### when time becomes a loop

`then` exposes a new `when`. You can go on ad infinitum.

```js
command(app.vent)
	.when('foo')
	.then(fooFn)
	.when('bar')
	.then(barFn)
// you catch the drift
```

## Event relaying

Obviously `backbone.whenthen` can be used as a simple event translator/relayer, for translating module events for instance:

```js
command(app.vent)
	.when('user:selection:completed')
	.then('account:user:selected');
//yeah, yeah I know, not the best of examples
```

## License

MIT Copyright (c) 2015 Camille Reynders

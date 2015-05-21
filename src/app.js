require('source-map-support').install();

var Promise = module.exports.Promise = require('./lib/promise')();
var Component = module.exports.Component = require('./lib/component')(Promise);
var Core = module.exports.Core = require('./lib/core')(Promise);
var ContextManager = module.exports.ContextManager = require('./lib/contextManager')(Core, Component);

module.exports.TypeLibrary = require('./lib/typeLibrary')(Core, Component, Promise, ContextManager);
var _ = require('lodash');

module.exports = function (Core, Component, Promise, ContextManager) {
    var TypeLibrary = Core.extend({
        'loadAsync': Promise.coroutine(function* (options) {
            var baseLoadPath = options.path;
            var requireOverrides = options.requireOverrides;
            var graph = options.graph;
            
            var typeLibrary = Core.create();
            typeLibrary.defineType('Core', Core);
            typeLibrary.defineType('Component', Component);
            typeLibrary.defineType('Promise', Promise);
            typeLibrary.defineType('ContextManager', ContextManager);
            typeLibrary.defineType('TypeLibrary', TypeLibrary);
            
            var cm = ContextManager.create({
                typeLibraries: {
                    'typeLibrary': typeLibrary
                },
                
                requireOverrides: requireOverrides
            });
            
            var fs = cm.require('fs');
            var path = cm.require('path');
            
            // Load the handlers from the path specified in the options.
            var handlers = yield (function loadDir(loadPath) {
                return fs.readdirAsync(loadPath).reduce(function (result, item) {
                    if (item.startsWith('.')) { return result }
                    
                    var itemPath = path.join(loadPath, item);
                    
                    return fs.statAsync(itemPath).then(function (stats) {
                        if (stats.isFile()) { result.files.push(itemPath) }
                        else if (stats.isDirectory()) { result.directories.push(itemPath) }
                    }).return(result);
                }, { files: [], directories: [] }).then(function (result) {
                    return Promise.map(result.directories, loadDir).then(function (dirs) {
                        return _.flatten(dirs);
                    }).then(function (subFiles) {
                        return _.union(result.files, subFiles);
                    });
                });
            })(baseLoadPath).map(function (handlerPath) {
                var basePath = `${baseLoadPath}/`;
                var ext = path.extname(handlerPath);
                
                return {
                    name: handlerPath.replace(basePath, '').replace(ext, ''),
                    path: handlerPath
                };
            });
            
            (function loadGraph(graph, typeLibrary, contextManager) {
                _.each(graph, function (item, key) {
                    if (_.isString(item)) {
                        item = {
                            handler: item
                        };
                    }
                    
                    var Type;
                    if (item.handler) {
                        var handler = _.findWhere(handlers, { name: item.handler });
                        if (!handler) { throw new Error(`Handler "${item.handler}" not defined`) }
                        
                        Type = require(handler.path)(contextManager);
                    }
                    else {
                        Type = Core;
                    }
                    
                    if (item.graph) {
                        typeLibrary.defineType(key, Type, function (parent) {
                            var subContextManager = contextManager.spawnSubContext(item.contextName, parent);
                            loadGraph(item.graph, parent, subContextManager);
                        });
                    }
                    else {
                        typeLibrary.defineType(key, Type);
                    }
                });
            })(graph, typeLibrary, cm);
            
            return typeLibrary;
        })
    });
    
    return TypeLibrary;
};
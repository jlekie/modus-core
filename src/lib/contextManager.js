var _ = require('lodash');

module.exports = function (Core, Component) {
    var ContextManager = Core.extend({
        'init': function () {
            this.contexts = this.contexts || {};
        },
        
        'getType': function (typeName) {
            var typesLibraries = this.get('typeLibraries');
            
            var type;
            _.find(typesLibraries, function (typeLibrary) {
                type = typeLibrary.tryGetType(typeName);
                return type;
            });
            
            if (!type) { throw new Error('Type "' + typeName + '" not defined') }
            
            return type;
        },
        'require': function (depName) {
            var requireOverride = this.get('requireOverrides')[depName];
            
            if (requireOverride) {
                return requireOverride;
            }
            else {
                return module.require(depName);
            }
        },
        'getContext': function (contextName) {
            var context = this.get('contexts')[contextName];
            if (!context) { throw new Error('Context "' + contextName + '" not defined') }
            
            return context;
        },
        
        'extendType': function (type, props, propertyProps, components) {
            return this.getType(type).extend(props, propertyProps, components);
        },
        
        'createComponent': function (props) {
            return Component.create(props);
        },
        
        'spawnSubContext': function (name, ctx) {
            var baseTypeLibraries = this.tryGet('typeLibraries', {});
            var baseContexts = this.tryGet('contexts', {});
            var baseRequireOverrides = this.tryGet('requireOverrides', {});
            
            var typeLibraries = {};
            typeLibraries[name] = ctx;
            _.defaults(typeLibraries, baseTypeLibraries);
            
            var contexts = {};
            contexts[name] = ctx;
            _.defaults(contexts, baseContexts);
            
            return ContextManager.create({
                'typeLibraries': typeLibraries,
                'contexts': contexts,
                'requireOverrides': baseRequireOverrides
            });
        }
    });
    
    ContextManager.getRequire = ContextManager.require;
    
    return ContextManager;
};
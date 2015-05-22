var _ = require('lodash');

module.exports = function (Promise) {
    var Core = {
        'extend': function (props, propertyProps, components) {
            var prop, obj;
            
            props = props || {};
            
            obj = Object.create(this);
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    obj[prop] = props[prop];
                }
            }
            
            for (prop in propertyProps) {
                if (propertyProps.hasOwnProperty(prop)) {
                    Object.defineProperty(obj, prop, propertyProps[prop]);
                }
            }
            
            Object.defineProperty(obj, '__components__', {
                enumerable: false,
                writable: true
            });
            obj.__components__ = {};
            
            for (prop in components) {
                obj.__components__[prop] = components[prop];
            }
            
            return obj;
        },
        
        'create': function (props) {
            var prop, obj;
            
            props = props || {};
            
            obj = Object.create(this);
            
            Object.defineProperty(obj, '__types__', {
                enumerable: false,
                writable: true
            });
            obj.__types__ = {};
            
            Object.defineProperty(obj, '__dataMembers__', {
                enumerable: false,
                writable: true
            });
            obj.__dataMembers__ = {};
            
            Object.defineProperty(obj, '__baseKeys__', {
                enumerable: false,
                writable: true
            });
            obj.__baseKeys__ = _.keys(props);
            
            if (obj.__inlineHandler__) { obj.__inlineHandler__(obj) }
            if (obj.typeInit) { obj.typeInit(obj) }
            
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    obj[prop] = props[prop];
                }
            }
            
            if (obj.init) {
                Object.defineProperty(obj, '__initializedPromise__', {
                    enumerable: false,
                    value: obj.callAsync('init')
                });
            }
            else {
                Object.defineProperty(obj, '__initializedPromise__', {
                    enumerable: false,
                    value: Promise.resolve()
                });
            }
            
            Object.defineProperty(obj, 'initializedPromise', {
                get: function () { return obj.__initializedPromise__.return(obj) }
            });
            
            return obj;
        },
        'createAndInitialize': function () {
            var obj = this.create.apply(this, arguments);
            if (!obj.isInitialized()) { throw new Error('Synchronous initialization expected object to be immediately initialized') }
            if (obj.__initializedPromise__.isRejected()) { throw obj.__initializedPromise__.reason() }
            
            return obj;
        },
        'createAndInitializeAsync': function () {
            var obj = this.create.apply(this, arguments);
            
            return obj.initializedPromise;
        },
        
        'isInitialized': function () {
            if (!this.__initializedPromise__) { return false }
            
            return !this.__initializedPromise__.isPending();
        },
        
        'isDefined': function (propertyName) {
            return this[propertyName] !== undefined;
        },
        
        'get': function (propertyName) {
            if (this[propertyName] === undefined) {
                throw new Error('"' + propertyName + '" not defined.');
            }
            
            return this[propertyName];
        },
        'tryGet': function (propertyName, defaultValue) {
            if (this[propertyName] === undefined && defaultValue !== undefined) {
                return defaultValue;
            }
            else {
                return this[propertyName];
            }
        },
        
        'getDeferred': function (propertyName) {
            var self = this;
            
            return function () { return self.get(propertyName) };
        },
        'tryGetDeferred': function (propertyName, defaultValue) {
            var self = this;
            
            return function () { return self.tryGet(propertyName, defaultValue) };
        },
        
        'set': function (propertyName, value) {
            if (value === undefined) {
                throw new Error('Cannot set "' + propertyName + '" as undefined.');
            }
            
            if (this[propertyName] === undefined) {
                throw new Error('"' + propertyName + '" not defined.');
            }
            
            this[propertyName] = value;
            
            return this;
        },
        'define': function (propertyName, value) {
            if (value === undefined) {
                throw new Error('Cannot define "' + propertyName + '" as undefined.');
            }
            
            if (this[propertyName] !== undefined) {
                throw new Error('"' + propertyName + '" already defined.');
            }
            
            this[propertyName] = value;
            
            return this;
        },
        
        'setOrDefine': function (propertyName, value) {
            if (value === undefined) {
                throw new Error('Cannot set or define "' + propertyName + '" as undefined.');
            }
            
            this[propertyName] = value;
            
            return this;
        },
        
        'default': function (propertyName, value) {
            if (this[propertyName] === undefined) {
                this[propertyName] = value;
            }
            
            return this;
        },
        
        'call': function (methodName) {
            if (this[methodName] === undefined) {
                throw new Error('function "' + methodName + '" not defined.');
            }
            else if (!_.isFunction(this[methodName])) {
                throw new Error('"' + methodName + '" is not a function');
            }
            
            return this[methodName].apply(this, Array.prototype.slice.call(arguments, 1));
        },
        
        'defineType': function (typeName, def, inlineHandler) {
            if (!typeName) { throw new Error('Type name not specified') }
            
            var types = this.get('__types__');
            
            if (types[typeName]) { throw new Error('Type "' + typeName + '" already defined') }
            
            types[typeName] = [ def, inlineHandler ];
            
            return this;
        },
        'getType': function (typeName) {
            var types = this.get('__types__');
            
            if (!types[typeName]) { throw new Error('Type "' + typeName + '" not defined') }
            
            var type = types[typeName][0];
            
            if (types[typeName][1]) {
                type.__inlineHandler__ = types[typeName][1];
            }
            
            return type;
        },
        'tryGetType': function (typeName) {
            var types = this.get('__types__');
            
            if (!types[typeName]) { return }
            
            var type = types[typeName][0];
            
            if (types[typeName][1]) {
                type.__inlineHandler__ = types[typeName][1];
            }
            
            return type;
        },
        
        'createType': function (typeName, props) {
            var Type = this.getType(typeName);
            
            return Type.create(props);
        },
        'createAndInitializeType': function (typeName, props) {
            var Type = this.getType(typeName);
            
            return Type.createAndInitialize(props);
        },
        'createAndInitializeTypeAsync': function (typeName, props) {
            var Type = this.getType(typeName);
            
            return Type.createAndInitializeAsync(props);
        },
        
        'hasDataMember': function (memberName) {
            return this.__dataMembers__[memberName] !== undefined;
        },
        'getDataMember': function (memberName) {
            return this.__dataMembers__[memberName];
        },
        'tryGetDataMember': function (memberName, defaultValue) {
            if (this.__dataMembers__[memberName] === undefined && defaultValue !== undefined) {
                return defaultValue;
            }
            else {
                return this.__dataMembers__[memberName];
            }
        },
        'setDataMember': function (memberName, value) {
            this.__dataMembers__[memberName] = value;
        },
        'setUndefinedDataMember': function (memberName, value) {
            if (!_.isUndefined(this.__dataMembers__[memberName])) {
                throw new Error(`Cannot set member value "${memberName}" because it is already defined`);
            }
            
            this.__dataMembers__[memberName] = value;
        },
        'setUninitializedDataMember': function (memberName, value) {
            if (this.isInitialized()) { throw new Error(`Cannot set member value "${memberName}" after type has been initialized`) }
            
            this.__dataMembers__[memberName] = value;
        },
        
        'initMembersAsync': function (props) {
            var self = this;
            
            return Promise.each(_.pairs(props), function (keyValuePair) {
                var prop = keyValuePair[0];
                var details = keyValuePair[1];
                
                self.tryDefine(prop, details.defaultValue);
                
                if (details.Type) {
                    if (_.isArray(self[prop])) {
                        return self.getAsync(prop).map(function (item) {
                            return details.Type.createAsync(item);
                        }).each(function (item) {
                            if (details.initMembers) {
                                return item.initMembersAsync(details.initMembers);
                            }
                        }).each(function (item) {
                            _.each(details.contexts || {}, function (ctx, key) {
                                item.defineContext(key, ctx);
                            });
                        }).then(function (items) {
                            self.set(prop, items);
                        });
                    }
                    else if (_.isObject(self[prop])) {
                        return self.getAsync(prop).then(function (item) {
                            return details.Type.createAsync(item);
                        }).tap(function (item) {
                            if (details.initMembers) {
                                return item.initMembersAsync(details.initMembers);
                            }
                        }).tap(function (item) {
                            _.each(details.contexts || {}, function (ctx, key) {
                                item.defineContext(key, ctx);
                            });
                        }).then(function (item) {
                            self.set(prop, item);
                        });
                    }
                    else {
                        throw new Error('Property needs to be an array or an object to initialize a type');
                    }
                }
            }).then(function () {
                return self;
            });
        },
        
        'findComponent': function (name) {
            var component = this.__components__[name];
            
            if (component) { return component }
            else if (this.__proto__.__components__) { return this.__proto__.findComponent(name) }
        },
        
        'resolveComponent': function (name) {
            var self = this;
            
            var component = this.findComponent(name);
            if (!component) { throw new Error(`Component "${name}" not defined`) }
            
            if (_.isFunction(component))
                return component.apply(self, Array.prototype.slice.call(arguments, 1));
            else
                return component;
        },
        'tryResolveComponent': function (name, defaultValue) {
            var self = this;
            
            var component = this.findComponent(name) || defaultValue;
            
            if (component) {
                if (_.isFunction(component))
                    return component.apply(self, Array.prototype.slice.call(arguments, 1));
                else
                    return component;
            }
        },
        
        'getAsync': function () { return Promise.resolve(this.get.apply(this, arguments)) },
        'tryGetAsync': function () { return Promise.resolve(this.tryGet.apply(this, arguments)) },
        'callAsync': function () { return Promise.resolve(this.call.apply(this, arguments)) },
        'resolveComponentAsync': function () { return Promise.resolve(this.resolveComponent.apply(this, arguments)) },
        
        'initDataMembers': function (props) {
            var self = this;
            
            var results = {};
            _.each(props, function (options, key) {
                var value = self.getDataMember(key);
                
                if (_.isUndefined(value) && !_.isUndefined(options.defaultValue)) { value = options.defaultValue }
                
                if (options.type && !_.isUndefined(value)) {
                    if (!_.isObject(value) && !_.isNull(value)) { throw new Error(`Cannot initialize property "${key}"; typed properties require an object`) }
                    
                    value = options.type.createAndInitialize(value);
                }
                
                if (options.validator) {
                    if (!options.validator(value)) { throw new Error(`Validation failed for key "${key}" with value of "${value}"`) }
                }
                
                self.setDataMember(key, value);
                
                results[key] = value;
            });
            
            return results;
        },
        'initDataMembersAsync': Promise.coroutine(function* (props) {
            var self = this;
            
            var results = {};
            yield Promise.each(_.pairs(props), Promise.coroutine(function* (prop) {
                var key = prop[0]; var options = prop[1];
                
                var value = self.getDataMember(key);
                
                if (_.isUndefined(value) && !_.isUndefined(options.defaultValue)) { value = options.defaultValue }
                
                if (options.type && !_.isUndefined(value)) {
                    if (!_.isObject(value) && !_.isNull(value)) { throw new Error(`Cannot initialize property "${key}"; typed properties require an object`) }
                    
                    value = yield options.type.createAndInitializeAsync(value);
                }
                
                if (options.validator) {
                    if (!options.validator(value)) { throw new Error(`Validation failed for key "${key}" with value of "${value}"`) }
                }
                
                self.setDataMember(key, value);
                
                results[key] = value;
            }));
            
            return results;
        }),
        
        'validateProps': function (props) {
            _.each(props, (validator, key) => {
                var value = _.get(this, key);
                if (!validator(value)) { throw new Error(`Validation failed for key "${key}" with value of "${value}"`) }
            });
        },
        
        'resolveBaseComponent': function () {
            var component = {};
            _.each(this.__baseKeys__, (baseKey) => {
                component[baseKey] = _.result(this, baseKey);
            });
            
            return component;
        },
        
        'freeze': function () {
            Object.freeze(this);
            
            return this;
        },
        'seal': function () {
            Object.seal(this);
            
            return this;
        },
        'preventExtensions': function () {
            Object.preventExtensions(this);
            
            return this;
        }
    };
    
    return Core;
};
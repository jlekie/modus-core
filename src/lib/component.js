var _ = require('lodash');

module.exports = function (Promise) {
    var Component = {
        'create': function (props) {
            var prop, obj;
            
            props = props || {};
            
            obj = Object.create(this);
            for (prop in props) {
                if (props.hasOwnProperty(prop)) {
                    if (props[prop].enumerable === undefined) { props[prop].enumerable = true }
                    Object.defineProperty(obj, prop, props[prop]);
                }
            }
            
            return obj;
        },
        
        'snapshot': function () {
            var hash = {};
            
            _.forIn(this, function (val, key) {
                if (_.isFunction(val)) {
                    // Do nothing
                }
                else if (_.isArray(val)) {
                    hash[key] = _.map(val, function (item) {
                        return snapshotValue(item, 'snapshot');
                    });
                }
                else {
                    hash[key] = snapshotValue(val, 'snapshot');
                }
            });
            
            return hash;
        },
        'snapshotAsync': function () {
            var hash = {};
            
            _.forIn(this, function (val, key) {
                if (_.isFunction(val)) {
                    // Do nothing
                }
                else if (_.isArray(val)) {
                    hash[key] = Promise.map(val, function (item) {
                        return snapshotValue(item, 'snapshotAsync');
                    });
                }
                else {
                    hash[key] = snapshotValue(val, 'snapshotAsync');
                }
            });
            
            return Promise.props(hash);
        }
    };
    
    function snapshotValue(val, snapshotFunc) {
        if (Component.isPrototypeOf(val)) {
            return val[snapshotFunc]();
        }
        else {
            return val;
        }
    }
    
    return Component;
};
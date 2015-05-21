var _ = require('lodash');

module.exports = function () {
    var Promise = require('bluebird/js/main/promise')();
    
    //Promise.longStackTraces();
    
    Promise.onPossiblyUnhandledRejection(function (err, promise) {
        //logger.warn('UNHANDLED REJECTION');
        //logger.warn(err);
        
        if (err.stack) {
            console.log('UNHANDLED REJECTION: ' + err.stack);
        }
        else {
            console.log('UNHANDLED REJECTION: ' + err);
        }
    });
    
    Promise.prototype.getAsync = Promise.prototype.get;
    Promise.prototype.callAsync = Promise.prototype.call;
    
    Promise.prototype.tryGet = function (prop, defaultValue) {
        return this.get(prop).then(function (val) {
            if (val === undefined && defaultValue !== undefined) {
                return defaultValue;
            }
            else {
                return val;
            }
        });
    };
    
    // Promise.coroutine.addYieldHandler(function (value) {
    //     if (_.isArray(value)) { return Promise.all(value) }
    // });
    // Promise.coroutine.addYieldHandler(function (value) {
    //     if (_.isPlainObject(value)) { return Promise.props(value) }
    // });
    
    return Promise;
};
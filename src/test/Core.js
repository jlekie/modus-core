/*global describe:false, it:false, before:false, beforeEach:false, after:false, afterEach:false*/

require('chai').should();
var expect = require('chai').expect;
var co = require('bluebird').coroutine;

describe('Type Library', function() {
    var Type;
    before(co(function* () {
        var Promise = require('../lib/promise')();
        Type = require('../lib/core')(Promise);
    }));
    
    it('should have function extend()', function() {
        Type.should.have.property('extend').that.is.a('function');
    });
    
    it('should have function create()', function() {
        Type.should.have.property('create').that.is.a('function');
    });
    it('should have function createAndInitialize()', function() {
        Type.should.have.property('createAndInitialize').that.is.a('function');
    });
    it('should have function createAndInitializeAsync()', function() {
        Type.should.have.property('createAndInitializeAsync').that.is.a('function');
    });
    
    it('should have function isInitialized()', function() {
        Type.should.have.property('isInitialized').that.is.a('function');
    });
    
    it('should have function get()', function() {
        Type.should.have.property('get').that.is.a('function');
    });
    it('should have function getAsync()', function() {
        Type.should.have.property('getAsync').that.is.a('function');
    });
    it('should have function set()', function() {
        Type.should.have.property('set').that.is.a('function');
    });
    
    it('should have function call()', function() {
        Type.should.have.property('call').that.is.a('function');
    });
    it('should have function callAsync()', function() {
        Type.should.have.property('callAsync').that.is.a('function');
    });
    
    it('should have function getType()', function() {
        Type.should.have.property('getType').that.is.a('function');
    });
    it('should have function createType()', function() {
        Type.should.have.property('createType').that.is.a('function');
    });
    it('should have function createAndInitializeType()', function() {
        Type.should.have.property('createAndInitializeType').that.is.a('function');
    });
    it('should have function createAndInitializeTypeAsync()', function() {
        Type.should.have.property('createAndInitializeTypeAsync').that.is.a('function');
    });
    
    it('should have function initDataMembers()', function() {
        Type.should.have.property('initDataMembers').that.is.a('function');
    });
    it('should have function validateProps()', function() {
        Type.should.have.property('validateProps').that.is.a('function');
    });
    
    it('should have function hasDataMember()', function() {
        Type.should.have.property('hasDataMember').that.is.a('function');
    });
    it('should have function getDataMember()', function() {
        Type.should.have.property('getDataMember').that.is.a('function');
    });
    it('should have function setDataMember()', function() {
        Type.should.have.property('setDataMember').that.is.a('function');
    });
    it('should have function setUndefinedDataMember()', function() {
        Type.should.have.property('setUndefinedDataMember').that.is.a('function');
    });
    
    it('should have function resolveBaseComponent()', function() {
        Type.should.have.property('resolveBaseComponent').that.is.a('function');
    });
});
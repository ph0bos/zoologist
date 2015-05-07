
/**
 * ServiceDiscovery.
 *
 * @module node-service-discovery
 */

var log          = require('bunyan').createLogger({ name: 'service-resolver' });
var async        = require('async');
var util         = require('util');
var uuid         = require('uuid').v4;
var zk           = require('node-zookeeper-client');
var CreateMode   = require('node-zookeeper-client').CreateMode;
var customErr    = require('custom-error-generator');
var EventEmitter = require('events').EventEmitter;

/**
 * Custom Errors
 */
var NotFoundError = customErr('NotFoundError', Error);

/**
 * Inherit from EventEmitter.
 */
util.inherits(ServiceDiscovery, EventEmitter);

/**
 * ServiceDiscovery Constructor
 * 
 * @public
 * @constructor ServiceDiscovery
 *
 * @param client {Zoologist} A Zoologist instance.
 * @param basePath {String} Service basePath.
 * @param serviceInstance {ServiceInstance} Service Instance.
 */
function ServiceDiscovery(client, basePath, serviceInstance) {  
  this.client          = client;
  this.basePath        = basePath;
  this.serviceInstance = serviceInstance;
};

/**
 * Register the service with ZooKeeper.
 * 
 * @public
 * @method registerService
 *
 * @param address {String} Host address.
 * @param port {Number} Host port.
 * @param callback {Function} optional callback function.
 */
ServiceDiscovery.prototype.registerService = function (address, port, callback) {
  var self = this;
  
  async.waterfall([
    createServiceBasePath,
    registerService
  ], completed);

  // Create the base service path
  function createServiceBasePath(cb) {
    var servicePath = [ self.zooKeeper.getBasePath(), self.serviceName ].join('/');

    self.zooKeeper.getClient().mkdirp(servicePath, cb);
  }

  // Register the service (attach to base path)
  function registerService(serviceBasePath, cb) {
    var serviceId   = uuid();
    var servicePath = [ serviceBasePath, serviceId ].join('/');
    var data        = self.createServiceData(serviceId, [ self.serviceName, serviceId ].join('/'), address, port);

    self.data = data;

    self.zooKeeper.getClient()
      .transaction()
      .create(servicePath, new Buffer(JSON.stringify(data)), null, CreateMode.EPHEMERAL)
      .commit(cb);
  }

  // All done, call master callback
  function completed (err, res) { 
    if (err) {
      return callback(err);
    }

    callback(err, self.data);  
  }
};

/**
 * Unregister the service with ZooKeeper.
 * 
 * @public
 * @method unRegisterService
 *
 * @param serviceId {String} Service to unregister.
 * @param callback {Function} optional callback function.
 */
ServiceDiscovery.prototype.unRegisterService = function (serviceId, callback) {
  var serviceInstancePath = [ this.zooKeeper.getBasePath(), this.serviceName, serviceId ].join('/');

  this.zooKeeper.getClient()
    .transaction()
    .remove(serviceInstancePath)
    .commit(callback);
};

/**
 * Create a data object defining the properties of a service.
 * 
 * @private
 * @method _createServiceData
 *
 * @param id {String} UUID of the service
 * @param name {String} Name of the service
 * @param address {String} Address of the service (e.g. '127.0.0.1')
 * @param port {String} Port of the service (e.g. 8080)
 * @param sslPort {String} SSL port of the service (e.g. 8181)
 *
 * @return data {Object} return the data object
 */
ServiceDiscovery.prototype.createServiceData = function (id, name, address, port, sslPort) {
  var data = {
    id: id,
    name: name,
    address: address,
    port: port,
    sslPort: sslPort,
    payload: null,
    registrationTimeUTC: Date.now(),
    serviceType: 'DYNAMIC',
    uriSpec: {
      parts: [
        {
          value: 'scheme',
          variable: true
        },
        {
          value: '://',
          variable: false
        },
        {
          value: 'address',
          variable: true
        },
        {
          value: ':',
          variable: false
        },
        {
          value: 'port',
          variable: true
        }
      ]
    }
  };

  return data;
};

/**
 * Unregister the service with ZooKeeper.
 * 
 * @public
 * @method unRegisterService
 *
 * @param serviceId {String} Service to unregister.
 * @param callback {Function} optional callback function.
 */
ServiceDiscovery.prototype.unRegisterService = function (serviceId, callback) {
  var serviceInstancePath = [ this.zooKeeper.getBasePath(), this.serviceName, serviceId ].join('/');

  this.zooKeeper.getClient()
    .transaction()
    .remove(serviceInstancePath)
    .commit(callback);
};

module.exports = ServiceDiscovery;

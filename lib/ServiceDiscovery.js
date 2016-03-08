
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

var ServiceProviderBuilder = require('./ServiceProviderBuilder');

/**
 * Custom Errors
 */
var NotFoundError = customErr('NotFoundError', Error);

// Statics
var DEFAULT_BASE_PATH = 'services';

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
  this.basePath        = basePath || DEFAULT_BASE_PATH;
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
ServiceDiscovery.prototype.registerService = function (callback) {
  var self = this;

  async.waterfall([
    createServiceBasePath,
    registerService
  ], completed);

  // Create the base service path
  function createServiceBasePath(cb) {
    var servicePath = [ self.basePath, self.serviceInstance.name ].join('/');

    self.client
      .getClient()
      .mkdirp(servicePath, cb);
  }

  // Register the service (attach to base path)
  function registerService(servicePath, cb) {
    var serviceId   = uuid();
    var servicePath = [ servicePath, serviceId ].join('/');
    var data        = self.serviceInstance.getData();

    data.id                   = serviceId;
    self.data                 = data;
    self.serviceInstance.data = data;

    self.client
      .getClient()
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
  var serviceInstancePath = [ this.basePath, this.serviceInstance.name, serviceId ].join('/');

  this.client
    .getClient()
    .transaction()
    .remove(serviceInstancePath)
    .commit(callback);
};

/**
 * Return the data for a service.
 *
 * @public
 * @method getData
 */
ServiceDiscovery.prototype.getData = function () {
  return this.data;
};

/**
 * Build a service provider.
 *
 * @public
 * @method serviceProviderBuilder
 */
ServiceDiscovery.prototype.serviceProviderBuilder = function () {
  var builder = ServiceProviderBuilder.builder();

  builder.serviceDiscovery(this);

  return builder;
};

/**
 * Locate instances of a particular service.
 *
 * @public
 * @method queryForInstances
 *
 * @param serviceId {String} Service to unregister.
 * @param callback {Function} optional callback function.
 */
ServiceDiscovery.prototype.queryForInstances = function (serviceName, callback) {
  var servicePath = [ this.basePath, serviceName ].join('/');
  this.client.getClientwithConnectionCheck().getChildren(servicePath, null, callback);
};

module.exports = ServiceDiscovery;

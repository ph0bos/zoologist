
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
 * @param zooKeeper {ZooKeeperClient} A ZooKeeperClient instance.
 * @param serviceName {String} Service name.
 */
function ServiceDiscovery(zooKeeper, serviceName) {  
  this.zooKeeper   = zooKeeper;
  this.serviceName = serviceName;
};

/**
 * Return a random active instance of a service.
 * 
 * @public
 * @method getInstance
 *
 * @param callback {Function} optional callback function.
 */
ServiceDiscovery.prototype.registerService = function (address, port, callback) {
  var self = this;

  var id              = uuid();
  var absSvcPath      = [ self.zooKeeper.getBasePath(), self.serviceName ].join('/');
  var svcInstancePath = [ absSvcPath, id ].join('/');
  var data            = self.createServiceData(id, [ self.serviceName, id ].join('/'), address, port);

  async.waterfall([
    // Create service path
    function(cb) {
      self.zooKeeper.getClient().mkdirp(absSvcPath, cb);
    },

    // Create service instance
    function(path, cb) {
      self.zooKeeper.getClient().transaction().
        create(svcInstancePath, new Buffer(JSON.stringify(data)), null, CreateMode.EPHEMERAL).
        commit(cb);
    }
  ], function (err, res) {
    if (err) {
      return callback(err);
    }

    callback(err, res[0].path); 
  });
};

/**
 * Return a random active instance of a service.
 * 
 * @public
 * @method getInstance
 *
 * @param callback {Function} optional callback function.
 */
ServiceDiscovery.prototype.unRegisterService = function () {

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

module.exports = ServiceDiscovery;
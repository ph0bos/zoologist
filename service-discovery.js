var EventEmitter  = require('events').EventEmitter;
var zookeeper     = require('node-zookeeper-client');
var NotFoundError = require('./errors/not-found-error')

/**
 * Statics
 */
ServiceDiscovery.prototype.NO_NODE = 'NO_NODE';

/**
 *
 */
function ServiceDiscovery(connectionString, options) {
  this.client = zookeeper.createClient('localhost:2181', options);
  this.client.connect();
};

/**
 *
 */
ServiceDiscovery.prototype.registerService = function () {
  return this.client;
};

/**
 *
 */
ServiceDiscovery.prototype.unregisterService = function () {
  return this.client;
};

/**
 *
 */
ServiceDiscovery.prototype.getServiceInstance = function (servicePath, callback) {
  var self = this;

  self.client.getChildren(servicePath, null, function (err, children, stat) {
    if ((err !== null && err.name == self.NO_NODE) || children.length === 0) {
      return callback(new NotFoundError('No records for "' + servicePath + '"'));
    }

    var serviceId = children[Math.floor((Math.random() * children.length))];
    var path      = [ servicePath, serviceId ].join('/');

    self.client.getData(path, null, function (err, data, stat) {
      return callback(err, JSON.parse(data), stat);
    });
  });
};

/**
 *
 */
function createServiceDiscoveryClient(connectionString, options) {
  return new ServiceDiscovery(connectionString, options);
}

exports.createServiceDiscoveryClient = createServiceDiscoveryClient;
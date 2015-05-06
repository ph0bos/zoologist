
/**
 * ServiceProvider.
 *
 * @module node-service-discovery
 */

var log          = require('bunyan').createLogger({ name: 'service-resolver' });
var async        = require('async');
var util         = require('util');
var zk           = require('node-zookeeper-client');
var customErr    = require('custom-error-generator');
var EventEmitter = require('events').EventEmitter;

/**
 * Custom Errors
 */
var NotFoundError  = customErr('NotFoundError', Error);
var ZooKeeperError = customErr('ZooKeeperError', Error);

/**
 * Inherit from EventEmitter.
 */
util.inherits(ServiceProvider, EventEmitter);

/**
 *
 */
function ServiceProvider(connectionString, basePath, serviceName, options) {	
  this.client = zk.createClient(connectionString, options);
  this.client.on('connected', this.emit.bind(this, 'connected'));
  this.client.on('disconnected', this.emit.bind(this, 'disconnected'));
  
  this.client.connect(onConnectComplete());

  function onConnectComplete(err) {
    if (err) {
      log.error(err);
    }
  }

  this.basePath    = basePath.match(/^\//) ? basePath : '/' + basePath;
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
ServiceProvider.prototype.getInstance = function(callback) {
  var self    = this;
  var absPath = [ self.basePath, self.serviceName ].join('/');

  async.waterfall([
    getAvailableServices,
    selectRandomService,
    getServiceData
  ], completed);

  // List available service instances
  function getAvailableServices (cb) {
    self.client.getChildren(absPath, null, cb); 
  }

  // Select a random service instance
  function selectRandomService (serviceList, stat, cb) {
    if (serviceList.length === 0) {
      return callback(new NotFoundError('No services located for ID: ' + self.serviceName));
    }

    var serviceId   = serviceList[Math.floor((Math.random() * serviceList.length))];
    var servicePath = [ absPath, serviceId ].join('/');
      
    cb(null, servicePath);
  }

  // Return the data for a service
  function getServiceData (servicePath, cb) {
    self.client.getData(servicePath, null, cb);
  }

  // All done, call master callback
  function completed (err, data, stat) { 
    if (err !== null && err.name === 'NO_NODE') {
      return callback(new NotFoundError('No services active for serviceId: ' + self.serviceName));
    }

    return callback(err, JSON.parse(data), stat);  
  }
};

module.exports = ServiceProvider;
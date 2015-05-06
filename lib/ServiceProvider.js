'use strict';

/**
 * ServiceProvider.
 *
 * @module node-service-discovery
 */

var log          = require('bunyan').createLogger({ name: 'service-resolver' });
var async        = require('async');
var util         = require('util');
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
 * ServiceProvider Constructor
 * 
 * @public
 * @constructor ServiceProvider
 *
 * @param zooKeeper {ZooKeeperClient} A ZooKeeperClient instance.
 * @param serviceName {String} Service name.
 */
function ServiceProvider(zooKeeper, serviceName) {	
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
ServiceProvider.prototype.getInstance = function(callback) {
  var self    = this;
  var absPath = [ self.zooKeeper.getBasePath(), self.serviceName ].join('/');

  async.waterfall([
    getAvailableServices,
    selectRandomService,
    getServiceData
  ], completed);

  // List available service instances
  function getAvailableServices (cb) {
    self.zooKeeper.getClient().getChildren(absPath, null, cb); 
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
    self.zooKeeper.getClient().getData(servicePath, null, cb);
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
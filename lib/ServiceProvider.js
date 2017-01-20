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
var cache        = require('memory-cache');
var EventEmitter = require('events').EventEmitter;

var DEFAULTS = {
  scheme: 'http'
};

var SERVICE_CACHE_KEY     = 'service-provider:';
var SERVICE_CACHE_TTL_SEC = 2000;

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
 * @param: providerStrategy {String} Instance selection algorithm ('Random' or 'RoundRobin').
 */
function ServiceProvider(serviceDiscovery, serviceName, providerStrategy) {
  this.serviceDiscovery  = serviceDiscovery;
  this.serviceName       = serviceName;
  this.providerStrategy  = providerStrategy || 'RoundRobin';
  this.lastInstanceIndex = 0;
};

/**
 * Build the UriSpec based on the template and variables.
 *
 * @public
 */
function buildUriSpec(data) {
  var uriSpec = '';

  data.uriSpec.parts.forEach(function(part) {
    if (part.variable) {
      if (data[part.value] == undefined && DEFAULTS[part.value]) {
        part.value = DEFAULTS[part.value];
      } else {
        part.value = data[part.value];
      }
    }

    uriSpec += part.value;
  });

  return uriSpec;
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
  var absPath = [ self.serviceDiscovery.basePath, self.serviceName ].join('/');

  var providerStrategyFunction;

  if (self.providerStrategy === 'Random') {
    providerStrategyFunction = selectServiceByRandomiser;
  } else {
    providerStrategyFunction = selectServiceByRoundRobin;
  }

  async.waterfall([
    getAvailableServices,
    providerStrategyFunction,
    getServiceData
  ], completed);

  // List available service instances
  function getAvailableServices (cb) {
    var cacheKey = SERVICE_CACHE_KEY + absPath;
    var cachedServices = cache.get(cacheKey);

    if (cachedServices && cachedServices.length > 0) {
      return cb(null, cachedServices, {});
    }

    self.serviceDiscovery.client.getClientwithConnectionCheck().getChildren(absPath, null, function(err, serviceList, stat) {
      if (!err && serviceList.length > 0) {
        cache.put(cacheKey, serviceList, SERVICE_CACHE_TTL_SEC);
      }

      cb(err, serviceList, stat);
    });
  };

  // Select a random service instance
  function selectServiceByRandomiser (serviceList, stat, cb) {
    if (serviceList.length === 0) {
      return callback(new NotFoundError('No services located for ID: ' + self.serviceName));
    }

    var serviceId   = serviceList[Math.floor((Math.random() * serviceList.length))];
    var servicePath = [ absPath, serviceId ].join('/');

    cb(null, servicePath);
  };

  // Select the next service using a robin robin approach
  function selectServiceByRoundRobin (serviceList, stat, cb) {
    if (serviceList.length === 0) {
      return callback(new NotFoundError('No services located for ID: ' + self.serviceName));
    }

    var serviceId;

    if (serviceList[++self.lastInstanceIndex]) {
      serviceId = serviceList[self.lastInstanceIndex];
    } else {
      self.lastInstanceIndex = 0;
      serviceId = serviceList[0];
    }

    var servicePath = [ absPath, serviceId ].join('/');

    cb(null, servicePath);
  };

  // Return the data for a service
  function getServiceData (servicePath, cb) {
    self.serviceDiscovery.client.getClient().getData(servicePath, null, cb);
  };

  // All done, call master callback
  function completed (err, data, stat) {
    if (err !== null && err.name === 'NO_NODE') {
      return callback(new NotFoundError('No services active for serviceId: ' + self.serviceName));
    }

    data            = (data) ? JSON.parse(data) : {};
    data.uriSpec    = buildUriSpec(data);
    data.serviceUrl = data.uriSpec + '/' + data.name;

    return callback(err, data, stat);
  };
};

module.exports = ServiceProvider;

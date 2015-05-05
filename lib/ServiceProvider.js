
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
var NotFoundError = customErr('NotFoundError', Error);

/**
 * Inherit from EventEmitter.
 */
util.inherits(ServiceProvider, EventEmitter);

/**
 *
 */
function ServiceProvider (connectionString, basePath, serviceName, options) {	
  this.client      = zk.createClient(connectionString, options);
  this.basePath    = basePath.match(/^\//) ? basePath : '/' + basePath;
  this.serviceName = serviceName;

  this.client.connect(function(err) {
    if (err) log.error(err);
  });

  this.client.on('connected', this.emit.bind(this, 'connected'));
  this.client.on('disconnected', this.emit.bind(this, 'disconnected'));
};

/**
 * Return a random active instance of a service.
 * 
 * @public
 * @method getInstance
 *
 * @param callback {Function} optional callback function.
 */
ServiceProvider.prototype.getInstance = function (callback) {
  var self    = this;
  var absPath = [ self.basePath, self.serviceName ].join('/');

  async.waterfall([
    // List available services
    function(cb) {
      self.client.getChildren(absPath, null, cb);  
    },

    // Get a random service instance
    function(serviceList, stat, cb) {
      if (serviceList.length === 0) {
        return callback(new NotFoundError('No services located for ID: ' + self.serviceName));
      }

      var svcId   = serviceList[Math.floor((Math.random() * serviceList.length))];
      var svcPath = [ absPath, svcId ].join('/');
      
      self.client.getData(svcPath, null, cb);
    },
  ], function (err, data, stat) {
    if (err !== null && err.name === 'NO_NODE') {
      return callback(new NotFoundError('No services located for ID: ' + self.serviceName));
    }
    
    return callback(err, JSON.parse(data), stat);  
  });
};

module.exports = ServiceProvider;
'use strict';

/**
 * ServiceProviderBuilder.
 *
 * @module zoologist
 */

var ServiceProvider = require('./ServiceProvider');

function ServiceProviderBuilder() {
  this.serviceProvider = {};
};

ServiceProviderBuilder.prototype.serviceDiscovery = function(serviceDiscovery) {
  this.serviceProvider.serviceDiscovery = serviceDiscovery;
  return this;
};

ServiceProviderBuilder.prototype.serviceName = function(serviceName) {
  this.serviceProvider.serviceName = serviceName;
  return this;
};

ServiceProviderBuilder.prototype.build = function() {
  return new ServiceProvider(
      this.serviceProvider.serviceDiscovery,
      this.serviceProvider.serviceName);
};

module.exports = ServiceProviderBuilder;

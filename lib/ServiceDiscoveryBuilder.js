'use strict';

/**
 * ServiceDiscoveryBuilder.
 *
 * @module zoologist
 */
var ServiceDiscovery = require('./ServiceDiscovery');

function ServiceDiscoveryBuilder() {
  this.serviceDiscovery = {};
};

function builder() {
  return new ServiceDiscoveryBuilder();
};

ServiceDiscoveryBuilder.prototype.basePath = function(basePath) {
  this.serviceDiscovery.basePath = basePath;
};

ServiceDiscoveryBuilder.prototype.client = function(client) {
  this.serviceDiscovery.client = client;
};

ServiceDiscoveryBuilder.prototype.thisInstance = function(instance) {
  this.serviceDiscovery.instance = instance;
};

ServiceDiscoveryBuilder.prototype.build = function() {
  return new ServiceDiscovery(this.serviceDiscovery.client, this.serviceDiscovery.basePath, this.serviceDiscovery.instance);
};

module.exports.builder = builder;

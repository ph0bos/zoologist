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
  // Pre-process basePath (ZooKeeper expects basePath to start with a slash)
  basePath = basePath.match(/^\//) ? basePath : '/' + basePath;

  this.serviceDiscovery.basePath = basePath;
  return this;
};

ServiceDiscoveryBuilder.prototype.client = function(client) {
  this.serviceDiscovery.client = client;
  return this;
};

ServiceDiscoveryBuilder.prototype.thisInstance = function(instance) {
  this.serviceDiscovery.instance = instance;
  return this;
};

ServiceDiscoveryBuilder.prototype.build = function() {
  return new ServiceDiscovery(
      this.serviceDiscovery.client, 
      this.serviceDiscovery.basePath, 
      this.serviceDiscovery.instance);
};

module.exports.builder = builder;

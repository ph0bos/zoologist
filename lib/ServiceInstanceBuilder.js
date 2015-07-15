'use strict';

/**
 * ServiceInstanceBuilder.
 *
 * @module zoologist
 */
var ServiceInstance = require('./ServiceInstance');

function ServiceInstanceBuilder() {
  this.serviceInstance = {};
};

function builder() {
  return new ServiceInstanceBuilder();
};

ServiceInstanceBuilder.prototype.uriSpec = function(uriSpec) {
  this.serviceInstance.uriSpec = uriSpec;
  return this;
};

ServiceInstanceBuilder.prototype.address = function(address) {
  this.serviceInstance.address = address;
  return this;
};

ServiceInstanceBuilder.prototype.port = function(port) {
  this.serviceInstance.port = port;
  return this;
};

ServiceInstanceBuilder.prototype.name = function(name) {
  this.serviceInstance.name = name;
  return this;
};

ServiceInstanceBuilder.prototype.build = function() {
  return new ServiceInstance(
      this.serviceInstance.uriSpec,
      this.serviceInstance.address,
      this.serviceInstance.port,
      this.serviceInstance.name);
};

module.exports.builder = builder;

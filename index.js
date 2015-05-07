/**
 *
 * ZooKeeper Service Discovery.
 *
 * @module node-service-discovery-zk
 *
 */

var Zoologist               = require('./lib/Zoologist');
var ServiceDiscoveryBuilder = require('./lib/ServiceDiscoveryBuilder');
var ServiceInstanceBuilder  = require('./lib/ServiceInstanceBuilder');

// var ServiceProvider  = require('./lib/ServiceProvider');

exports.Zoologist               = Zoologist;
exports.ServiceDiscoveryBuilder = ServiceDiscoveryBuilder;
exports.ServiceInstanceBuilder  = ServiceInstanceBuilder;

// exports.ServiceProvider  = ServiceProvider;

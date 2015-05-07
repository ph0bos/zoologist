/**
 *
 * ZooKeeper Service Discovery.
 *
 * @module node-service-discovery-zk
 *
 */

var Zoologist               = require('./lib/Zoologist');
var ServiceDiscoveryBuilder = require('./lib/ServiceDiscoveryBuilder');
var ServiceDiscovery        = require('./lib/ServiceDiscovery');

// var ServiceProvider  = require('./lib/ServiceProvider');

exports.Zoologist               = Zoologist;
exports.ServiceDiscoveryBuilder = ServiceDiscoveryBuilder;
exports.ServiceDiscovery        = ServiceDiscovery;

// exports.ServiceProvider  = ServiceProvider;

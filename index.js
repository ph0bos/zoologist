/**
 *
 * ZooKeeper Service Discovery.
 *
 * @module node-service-discovery-zk
 *
 */

var ServiceProvider = require('./lib/ServiceProvider');
var ServiceDiscovery = require('./lib/ServiceDiscovery');

exports.ServiceDiscovery = ServiceDiscovery;
exports.ServiceProvider  = ServiceProvider;

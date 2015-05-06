/**
 *
 * ZooKeeper Service Discovery.
 *
 * @module node-service-discovery-zk
 *
 */

var ZooKeeperClient  = require('./lib/ZooKeeperClient');
var ServiceProvider  = require('./lib/ServiceProvider');
var ServiceDiscovery = require('./lib/ServiceDiscovery');

exports.ZooKeeperClient  = ZooKeeperClient;
exports.ServiceDiscovery = ServiceDiscovery;
exports.ServiceProvider  = ServiceProvider;

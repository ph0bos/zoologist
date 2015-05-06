'use strict';

/**
 * ZooKeeperClient.
 *
 * @module node-service-discovery
 */

var log          = require('bunyan').createLogger({ name: 'zookeeper-client' });
var util         = require('util');
var zk           = require('node-zookeeper-client');
var customErr    = require('custom-error-generator');
var EventEmitter = require('events').EventEmitter;

/**
 * Custom Errors
 */
var ZooKeeperError = customErr('ZooKeeperError', Error);

/**
 * Inherit from EventEmitter.
 */
util.inherits(ZooKeeperClient, EventEmitter);

/**
 * ZooKeeperClient Constructor
 * 
 * @public
 * @constructor ZooKeeperClient
 *
 * @param connectionString {String} ZooKeeper connection string.
 * @param basePath {String} Service basepath.
 * @param options {object} ZooKeeper connection options.
 */
function ZooKeeperClient(connectionString, basePath, options) {
  options = options || {};

  this.client = zk.createClient(connectionString, options);
  this.client.on('connected', this.emit.bind(this, 'connected'));
  this.client.on('disconnected', this.emit.bind(this, 'disconnected'));
  
  this.client.connect(onConnectComplete());

  function onConnectComplete(err) {
    if (err) {
      log.error(err);
    }
  }

  this.basePath = basePath.match(/^\//) ? basePath : '/' + basePath;
};

/**
 * Return the ZooKeeper Client delegate.
 *
 * @public
 * @method getClient
 */
ZooKeeperClient.prototype.getClient = function() {
  return this.client;
};

/**
 * Return the service basePath (e.g. /services).
 *
 * @public
 * @method getBasePath
 */
ZooKeeperClient.prototype.getBasePath = function() {
  return this.basePath;
};

module.exports = ZooKeeperClient;

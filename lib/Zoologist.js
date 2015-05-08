'use strict';

/**
 * Zoologist.
 *
 * @module node-service-discovery
 */

var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var zkClient     = require('node-zookeeper-client');
var customErr    = require('custom-error-generator');

// Custom Errors
var ZooKeeperError = customErr('ZooKeeperError', Error);

// Inherit from EventEmitter
util.inherits(Zoologist, EventEmitter);

// Defaults
var DEFAULT_RETRY_COUNT        = 5;
var DEFAULT_RETRY_WAIT_MS      = 1000;
var DEFAULT_CONNECT_TIMEOUT_MS = 1000;
var DEFAULT_SESSION_TIMEOUT_MS = 5000;

/**
 * Create a Zoologist framework client.
 * 
 * @public
 * @method newClient
 *
 * @param connectionString {String} ZooKeeper connection string.
 * @param retryCount {Number} Number of times to retry.
 * @param retryWait {Number} Time in ms to wait before retrying.
 * @param connectTimeout {Number} Time in ms before the ZooKeeper connection times out.
 * @param sessionTimeout {Number} Time in ms before the ZooKeeper session times out.
 *
 * @return data {Object} return the data object
 */
function newClient(connectionString, retryCount, retryWait, connectTimeout, sessionTimeout) {
  var options = {};

  options.retries        = retryCount      || DEFAULT_RETRY_COUNT;
  options.spinDelay      = retryWait       || DEFAULT_RETRY_WAIT_MS;
  options.connectTimeout = connectTimeout  || DEFAULT_CONNECT_TIMEOUT_MS;
  options.sessionTimeout = sessionTimeout  || DEFAULT_SESSION_TIMEOUT_MS;

  return new Zoologist(zkClient.createClient(connectionString, options));
};

/**
 * Zoologist constructor.
 * 
 * @private
 * @constructor Zoologist
 *
 * @param zkClient {Object} ZooKeeper client.
 */
function Zoologist(zkClient) {
  this.client = zkClient;

  this.client.on('connected', this.emit.bind(this, 'connected'));
  this.client.on('disconnected', this.emit.bind(this, 'disconnected'));
};

/**
 * Return the ZooKeeper client.
 * 
 * @public
 * @method getClient
 */
Zoologist.prototype.getClient = function() {
  return this.client;
};

/**
 * Start the Zoologist framework.
 * 
 * @public
 * @method start
 */
Zoologist.prototype.start = function() {
  this.client.connect();
};

/**
 * Close the Zoologist framework.
 * 
 * @public
 * @method close
 */
Zoologist.prototype.close = function() {
  // Not implemented
};

module.exports.newClient = newClient;

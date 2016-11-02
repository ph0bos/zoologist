'use strict';

/**
 * Zoologist.
 *
 * @module node-service-discovery
 */

var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var async        = require('async');
var Promise      = require("bluebird");
var zkClient     = require('node-zookeeper-client');
var _            = require('underscore');
var customErr    = require('custom-error-generator');

// Custom Errors
var ZooKeeperError = customErr('ZooKeeperError', Error);

// Inherit from EventEmitter
util.inherits(Zoologist, EventEmitter);

// Defaults
var DEFAULT_RETRY_COUNT        = 5;
var DEFAULT_RETRY_WAIT_MS      = 1000;
var DEFAULT_CONNECT_TIMEOUT_MS = 1000;
var DEFAULT_SESSION_TIMEOUT_MS = 10000;

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

  return new Zoologist(connectionString, options);
};

/**
 * Zoologist constructor.
 *
 * @private
 * @constructor Zoologist
 *
 * @param zkClient {Object} ZooKeeper client.
 */
function Zoologist(connectionString, options) {
  this.connectionString = connectionString;
  this.options = options;
  this.started = false;
  this.closed = false;
};

/**
 * Is the ZooKeeper Client Connected?
 *
 * @public
 * @method isConnected
 */
Zoologist.prototype.isConnected = function() {
  return this.client.getState() == zkClient.State.SYNC_CONNECTED;
};

/**
 * Return the ZooKeeper client.
 *
 * @public
 * @method getClient
 */
Zoologist.prototype.getClientwithConnectionCheck = function() {
  if (this.client.getState() !== zkClient.State.SYNC_CONNECTED) {
    throw new ZooKeeperError('Connection Not Established');
  }

  return this.client;
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
  var self = this;

  this.client = null;
  this.client = zkClient.createClient(this.connectionString, this.options);

  this.client.connect();

  this.client.once('connected', function () {
    self.started = true;
    self.emit('connected');
  });

  this.client.once('disconnected', function () {
    self.started = false;
    self.emit('disconnected');

    if (!self.closed){
      self.start();
    }
  });
};

/**
 *
 *
 * Close the Zoologist framework.
 *
 * @public
 * @method close
 */
Zoologist.prototype.close = function() {
  this.closed = true;
  this.client.close();
};

/**
 * Return if the client has been previously started.
 *
 * @public
 * @method getStarted
 */
Zoologist.prototype.getStarted = function() {
  return this.started;
};

module.exports.newClient = newClient;

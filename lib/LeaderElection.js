'use strict';

/**
 * ServiceProvider.
 *
 * @module node-service-discovery
 */

var log = require('bunyan').createLogger({name: 'service-resolver'});
var _ = require('underscore');
var async = require('async');
var util = require('util');
var customErr = require('custom-error-generator');
var cache = require('memory-cache');
var EventEmitter = require('events').EventEmitter;
var zkClient = require('node-zookeeper-client');
var CreateMode = require('node-zookeeper-client').CreateMode;

/**
 * Custom Errors
 */
var NotFoundError = customErr('NotFoundError', Error);
var ZooKeeperError = customErr('ZooKeeperError', Error);

/**
 * Inherit from EventEmitter.
 */
util.inherits(LeaderElection, EventEmitter);

/**
 *
 */
function LeaderElection(client, path, id, callback) {
  var self = this;

  self.client = client;
  self.path = path;
  self.id = id;
  self.znode = null;
  self._isGroupLeader = false;

  /**
   * Override the connection callback.
   */
  self.connectionCallback = callback || function (err, node) {
      if (err){
        log.error('connection error on start up', self.id);
      }
      else log.debug('connection started', self.znode);
    };

  if (self.client.started === true) {
    self._start(self.connectionCallback);
  }

  self.client.on('connected', function () {
    self._start(self.connectionCallback);
  });

  self.client.on('disconnected', function () {
    self._disconnect();
  });
}

LeaderElection.prototype._start = function (callback) {
  var self = this;

  if (self.znode) {
    this._watch();
    return callback(new Error('already part of an election'));
  }

  async.waterfall([
    createServiceBasePath,
    createEphemeral
  ], completed);

  // Create the base service path
  function createServiceBasePath(cb) {
    self.client
      .getClient()
      .mkdirp(self.path, cb);
  }

  // Creae the ephermeral node
  function createEphemeral(servicePath, cb) {
    self.client
      .getClient()
      .transaction()
      .create(self.path + '/' + self.id + '-', new Buffer(JSON.stringify({})), null, CreateMode.EPHEMERAL_SEQUENTIAL)
      .commit(cb);
  }

  // All done, call master callback
  function completed(err, res) {
    if (err) {
      return callback(err);
    }

    self.znode = res[0].path.replace(self.path + '/', '');
    self._watch();

    callback(err, res);
  }
};

LeaderElection.prototype._watch = function () {
  var self = this;

  function getChildrenCallback(err, data) {

    if (self.hasWithdrawn) {
      self._disconnect();
      return;
    }

    if (err) {
      // Do nothing on these particular errors since we proxy these
      // client states back to the consumer already in the constructor.
      if (err.getCode() !== zkClient.Exception.CONNECTION_LOSS &&
        err.getCode() !== zkClient.Exception.SESSION_EXPIRED) {
        log.error({err: err}, 'got zk error getting election nodes');
        self._disconnect();
        self.emit('error', err);
      }
    } else {

      data.sort(compare);

      if (self.znode) {
        var myIndex = data.indexOf(self.znode);

        if (myIndex === -1) {
          self.emit('error', new Error('my own znode not found in zk'));
        }

        var myLeader = (myIndex === 0 ? null : data[myIndex - 1]);
        var myFollower = ((myIndex + 1 === data.length) ? null : data[myIndex + 1]);

        log.info({
          currentMyLeader: self._myLeader,
          currentMyFollower: self._myFollower,
          currentIsGroupLeader: self._isGroupLeader,
          myIndex: myIndex,
          newMyLeader: myLeader,
          newMyFollower: myFollower
        }, 'Election.watch: determining new election state.');

        if (myIndex === -1) {
          return self.emit('error', new mod_verror.VError('my own znode not found in zk.'));
        }

        if (myIndex === 0 && !self._isGroupLeader) {
          self._myLeader = null;
          self._isGroupLeader = true;
          log.info('emitting groupLeader');
          self.emit('groupLeader');
        }

        if (self._myFollower !== myFollower) {
          self._myFollower = myFollower;
          log.info({follower: myFollower}, 'emitting follower');
          self.emit('follower', self._myFollower);
        }

        if (!self._myLeader) {
          self._myLeader = null;
        }

        if (self._myLeader !== myLeader) {
          self._myLeader = myLeader;
          log.info({leader: myLeader}, 'emitting leader');
          self.emit('leader', self._myLeader);
        }
      }

      // only emit the topology if it changes.
      log.debug({newTopology: data, oldTopology: self._topology}, 'checking topology');

      if (!_.isEqual(data, self._topology)) {
        log.info({newTopology: data, oldTopology: self._topology}, 'topology changed, emitting topology event');

        self._topology = data;
        self.emit('topology', data);
      }
    }
  }

  self.client
    .getClient()
    .getChildren(
      self.path,
      function watcher(event) {
        self._watch();
        self.client.getClient().getChildren(self.path, getChildrenCallback);
      },
      function (err, data) {
        getChildrenCallback(err, data);
      });
};

LeaderElection.prototype.withdraw = function (callback) {

  var serviceInstancePath = [this.path, this.znode].join('/');

  this.hasWithdrawn = true;

  this.client
    .getClient()
    .transaction()
    .remove(serviceInstancePath)
    .commit(callback);
};

LeaderElection.prototype._disconnect = function () {
  this._myLeader = null;
  this._myFollower = null;
  this._isGroupLeader = false;
};

function compare(a, b) {
  var seqA = parseInt(a.substring(a.lastIndexOf('-') + 1), 10);
  var seqB = parseInt(b.substring(b.lastIndexOf('-') + 1), 10);
  return (seqA - seqB);
}

LeaderElection.prototype.hasLeadership = function () {
  return this._isGroupLeader;
};

module.exports = LeaderElection;

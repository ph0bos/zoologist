'use strict';

/**
 * ServiceProvider.
 *
 * @module node-service-discovery
 */

var log       = require('bunyan').createLogger({name: 'service-resolver'});
var _         = require('underscore');
var async     = require('async');
var util      = require('util');
var cache     = require('memory-cache');

var EventEmitter = require('events').EventEmitter;

var zkClient   = require('node-zookeeper-client');

/**
 * Custom Errors
 */
var NotFoundError  = require('custom-error-generator')('NotFoundError', Error);
var ZooKeeperError = require('custom-error-generator')('ZooKeeperError', Error);

/**
 * Inherit from EventEmitter.
 */
util.inherits(LeaderElection, EventEmitter);

/**
 *
 */
function LeaderElection(client, path, id) {
  var self = this;

  self.watcher    = function(){ self._watch() };
  self.disconnect = function () {
    self._disconnect();
    self.emit('error', new Error('disconnected from zk'));
  };

  self.client = client;
  self.path = path + '/' + id;
  self.znode = null;
  self._isGroupLeader = false;
}

LeaderElection.prototype.start = function (callback) {
  var self = this;
  self._isWithdrawn = false;

  // Make sure we only store one disconnect listener at a time.
  self.client.removeListener('disconnected', self.disconnect);
  self.client.once('disconnected', self.disconnect);

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
      .create(self.path + '/node-', new Buffer(JSON.stringify({})), null, zkClient.CreateMode.EPHEMERAL_SEQUENTIAL)
      .commit(cb);
  }

  // All done, call master callback
  function completed(err, res) {
    if (err) {
      return callback(err);
    }

    self.znode = res[0].path.replace(self.path + '/', '');
    self._watch();

    return callback(err, res);
  }
};

LeaderElection.prototype.withdraw = function (callback) {
  var self = this;
  self._disconnect();

  if(!this.znode){
    log.warn("can not withdraw a znode that doesn't exist");
    return callback(new Error("znode that does not exist"));
  }

  var serviceInstancePath = [this.path, this.znode].join('/');

  self.client
    .getClient()
    .transaction()
    .check(serviceInstancePath)
    .remove(serviceInstancePath)
    .commit(function(err){
      self.znode = null;
      self.client.removeListener('disconnected', self.disconnect);
      callback(err);
    });
};

LeaderElection.prototype.destroy = function (callback) {
  var self = this;

  self.client
    .getClient()
    .getChildren(self.path, function(err, data){
      async.each(data, function(node, cb){
        var serviceInstancePath = [self.path, node].join('/');

        self.client
          .getClient()
          .transaction()
          .check(serviceInstancePath)
          .remove(serviceInstancePath)
          .commit(function(err){
              if(err) log.warn(err, "there was an issue removing a name from the path on destroy.");
              cb();
          });

      }, function(){
        self.client
          .getClient()
          .remove(self.path, function(err){
            self.client.removeListener('disconnected', self.disconnect);
            callback(err);
          });
      });
    })
};

LeaderElection.prototype.hasLeadership = function() {
  return this._isGroupLeader;
};

LeaderElection.prototype._watch = function () {

  var self = this;
  self.client.getClient().getChildren( self.path, self.watcher, getChildrenCallback);

  function getChildrenCallback(err, data) {

    // If we have withdrawn this election, just return;
    if (self._isWithdrawn || self.znode == undefined) return;

    // If the topology contains no nodes, then reset the election and error;
    if( data == undefined || data.length === 0){
      self._disconnect();
      self.znode = null;
      //log.error({err: err}, 'all nodes have gone');
      self.emit('error', new Error("all nodes have gone"));
      return;
    }

    if (err) {
      // Do nothing on these particular errors since we proxy these
      // client states back to the consumer already in the constructor.
      if (err.getCode() !== zkClient.Exception.CONNECTION_LOSS && err.getCode() !== zkClient.Exception.SESSION_EXPIRED) {
        self.withdraw(function(err) {
          log.error({err: err}, 'got zk error getting election nodes');
          self.emit('error', new Error("error getting election nodes"));
        });
        return;
      }
    } else {

      data.sort(compare);

      if (self.znode) {
        var myIndex = data.indexOf(self.znode);

        if (myIndex === -1) {
          self.withdraw(function(err){
            log.error({err: err}, 'my own znode not found in zk');
            self.emit('error', new Error('my own znode not found in zk'));
          });
          return;
        }

        var myLeader = (myIndex === 0 ? null : data[myIndex - 1]);
        var myFollower = ((myIndex + 1 === data.length) ? null : data[myIndex + 1]);

        log.debug({
          currentMyLeader: self._myLeader,
          currentMyFollower: self._myFollower,
          currentIsGroupLeader: self._isGroupLeader,
          myIndex: myIndex,
          newMyLeader: myLeader,
          newMyFollower: myFollower
        }, 'Election.watch: determining new election state.');


        if (myIndex === 0 && !self._isGroupLeader) {
          self._myLeader = null;
          self._isGroupLeader = true;
          log.debug('emitting groupLeader');
          self.emit('groupLeader');
        }

        if (self._myFollower !== myFollower) {
          self._myFollower = myFollower;
          log.debug({follower: myFollower}, 'emitting follower');
          self.emit('myFollower', self._myFollower);
        }

        if (!self._myLeader) {
          self._myLeader = null;
        }

        if (self._myLeader !== myLeader) {
          self._myLeader = myLeader;
          log.debug({leader: myLeader}, 'emitting myLeader');
          self.emit('myLeader', self._myLeader);
        }
      }

      // only emit the topology if it changes.
      log.debug({newTopology: data, oldTopology: self._topology}, 'checking topology');

      if (!_.isEqual(data, self._topology)) {
        log.debug({newTopology: data, oldTopology: self._topology}, 'topology changed, emitting topology event');

        self._topology = data;
        self.emit('topologyChange', data);
      }
    }
  }
};

LeaderElection.prototype._disconnect = function() {
  this._isWithdrawn = true;
  this._myLeader = null;
  this._myFollower = null;
  this._isGroupLeader = false;
};

function compare(a, b) {
  var seqA = parseInt(a.substring(a.lastIndexOf('-') + 1), 10);
  var seqB = parseInt(b.substring(b.lastIndexOf('-') + 1), 10);
  return (seqA - seqB);
}

module.exports = LeaderElection;

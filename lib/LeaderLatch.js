'use strict';

/**
 * ServiceProvider.
 *
 * @module node-service-discovery
 */

var log          = require('bunyan').createLogger({ name: 'service-resolver' });
var async        = require('async');
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var CreateMode   = require('node-zookeeper-client').CreateMode;

var LOCK_NAME = "latch-";

/**
 * Inherit from EventEmitter.
 */
util.inherits(LeaderLatch, EventEmitter);

/**
 *
 */
function LeaderLatch(client, path, id) {
  this.client        = client;
  this.path          = path;
  this.id            = id;
  this.hasLeadership = false;
};

LeaderLatch.prototype.start = function (callback) {
  var self = this;

  async.waterfall([
    createBasePath,
    createEphemeralNode
  ], completed);

  // Create the base service path
  function createBasePath(cb) {
    self.client
      .getClient()
      .mkdirp(self.path, cb);
  }

  // Creae the ephermeral node
  function createEphemeralNode(servicePath, cb) {
    self.client
      .getClient()
      .transaction()
      .create(self.path + '/' + self.id + '-', new Buffer(JSON.stringify({})), null, CreateMode.EPHEMERAL_SEQUENTIAL)
      .commit(cb);
  }

  // All done, call master callback
  function completed (err, res) {
    if (err) {
      return callback(err);
    }

    //self.znode = res[0].path.replace(servicePath + '/', '');
    //self.watch(servicePath);

    callback(err, res);
  }
};

LeaderLatch.prototype.close = function (callback) {
  var serviceInstancePath = [ this.path ].join('/');

  this.hasLeadership = false;

  this.client
    .getClient()
    .transaction()
    .remove(serviceInstancePath)
    .commit(callback);
};

LeaderLatch.prototype.hasLeadership = function () {
  return this.hasLeadership;
};

LeaderLatch.prototype.getLeader = function (callback) {
  this.getChildren(function(err, data) {
    console.log(data.indexOf(LOCK_NAME));
    callback(err, data[data.indexOf(LOCK_NAME)])
  })
};

LeaderLatch.prototype.getChildren = function (callback) {
  this.client.getClient().getChildren(this.path, null, function(err, data) {
    callback(err, data.sort(compare));
  });
};

//
// LeaderLatch.prototype.watch = function (servicePath) {
//   var self = this;
//
//   console.log('here');
//  // Get Children
//
//   // Get My Index
//
//     // No index (error)
//
//     // My Index == 0 (emit leader)
//
//     // Other (follower)
//
//
//   // Topology Change, rebalance?
//
//     // Children changed
//
//   function getChildrenCallback(err, data) {
//       if (err) {
//           // // Do nothing on these particular errors since we proxy these
//           // // client states back to the consumer already in the constructor.
//           // if (err.getCode() !== mod_zk.Exception.CONNECTION_LOSS &&
//           //     err.getCode() !== mod_zk.Exception.SESSION_EXPIRED) {
//           //     log.error({err: err}, 'got zk error getting election nodes');
//           //     self.emit('error', err);
//           // }
//       } else {
//           data.sort(compare);
//
// console.log('ssss');
//           if (self.znode) {
//               var myIndex = data.indexOf(self.znode);
//
// console.log(myIndex);
//
//               if (myIndex === -1) {
//                   self.emit('error', new mod_verror.VError(
//                       'my own znode not found in zk'));
//               }
//
//               var myLeader = (myIndex === 0 ? null : data[myIndex - 1]);
//
//               var myFollower = ((myIndex + 1 === data.length) ? null :
//                                 data[myIndex + 1]);
//
//                 log.info({
//                     currentMyLeader: self._myLeader,
//                     currentMyFollower: self._myFollower,
//                     currentIsGLeader: self._isGLeader,
//                     myIndex: myIndex,
//                     newMyLeader: myLeader,
//                     newMyFollower: myFollower
//                 }, 'Election.watch: determining new election state.');
//
//               if (myIndex === -1) {
//                   return self.emit('error', new mod_verror.VError(
//                       'my own znode not found in zk.'));
//               }
//
//               if (myIndex === 0 && !self._isGLeader) {
//                   self._myLeader = null;
//                   self._isGLeader = true;
//                   log.info('emitting gLeader');
//                   self.emit('gleader');
//               }
//
//               if (self._myFollower !== myFollower) {
//                   self._myFollower = myFollower;
//                   log.info({follower: myFollower}, 'emitting follower');
//                   self.emit('follower', self._myFollower);
//               }
//
//               if (!self._myLeader) {
//                   self._myLeader = null;
//               }
//
//               if (self._myLeader !== myLeader) {
//                   self._myLeader = myLeader;
//                   log.info({leader: myLeader}, 'emitting leader');
//                   self.emit('leader', self._myLeader);
//               }
//           }
//
//       }
//   }
//
//   self.client
//     .getClient()
//     .getChildren(
//       servicePath,
//       function watcher(event) {
//         self.watch(servicePath);
//         self.client.getClient().getChildren(servicePath, getChildrenCallback);
//       },
//       function (err, data) {
//         console.log(err, data);
//       });
// };

LeaderLatch.prototype.close = function (callback) {
};

function compare(a, b) {
  a = a.replace(LOCK_NAME, '');
  b = b.replace(LOCK_NAME, '');

  var seqA = parseInt(a.substring(a.lastIndexOf('-') + 1), 10);
  var seqB = parseInt(b.substring(b.lastIndexOf('-') + 1), 10);
  return (seqA - seqB);
}

/**
    public static String standardFixForSorting(String str, String lockName)
    {
        int index = str.lastIndexOf(lockName);
        if ( index >= 0 )
        {
            index += lockName.length();
            return index <= str.length() ? str.substring(index) : "";
        }
        return str;
    }
**/

module.exports = LeaderLatch;

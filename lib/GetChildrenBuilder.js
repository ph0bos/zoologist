'use strict';

/**
 * GetChildrenBuilder.
 *
 * @module zoologist
 */

var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise      = require("bluebird");
var _            = require('underscore');

/**
 * Statics
 */
var TIMEOUT_MS = 2000;

function GetChildrenBuilder() {
};

function builder() {
  return new GetChildrenBuilder();
};

GetChildrenBuilder.prototype.client = function(client) {
  this.client = client;
  return this;
};

/**
 * Return a list of children for a given path.
 *
 * This function is useful for recursively discovering a list of advertised services.
 *
 * @public
 * @method close
 */
GetChildrenBuilder.prototype.forPath = function(path, callback) {
  var client = Promise.promisifyAll(this.client.getClientwithConnectionCheck());
  var services = [];

  var recurse = function (path) {
    return client.getChildrenAsync(path)
      .then(function (res) {
        var children = res[0];
        var stats    = res[1];

        if (stats.dataLength > 0 && stats.numChildren == 0) {
          return client.getDataAsync(path)
            .then(function(data) {
              services.push(JSON.parse(data[0]).name);
              return children;
          });
        }

        return children;
      })
      .map(function (child) {
        return recurse(path + '/' + child);
      });
  };

  recurse(path).then(function (res) {
    callback(null, _.uniq(services));
  })
  .timeout(TIMEOUT_MS)
  .catch(Promise.TimeoutError, function (err) {
    return callback(new Error('GetChildrenBuilder Error: Timeout resolving children'));
  })
  .catch(function (err) {
    return callback(err);
  });
};

module.exports.builder = builder;

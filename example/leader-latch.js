'use strict';

var Zoologist      = require('..').Zoologist;
var LeaderLatch = require('..').LeaderLatch;

var latch;

var client  = Zoologist.newClient('127.0.0.1:2181');

client.start();

client.once('connected', function () {
  latch = new LeaderLatch(client, '/my/path', 'my-id');

  latch.start(function(err, data) {
    console.log(err, data);
  });

  latch.getChildren(function(err, children) {
    console.log(children);
  });

  latch.getLeader(function(err, leader) {
    console.log(leader);
  });

});
  //
  // latch.start('/my/path', 'my-name', function(err, node) {
  //   console.log(err, node);
  // });
  //
  // latch.on('gleader  ', function(e) {
  //   console.log('LEADER');
  // });


//election.watch('/my/path');

setInterval(function() {
}, 1000);

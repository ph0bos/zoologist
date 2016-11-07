'use strict';

var async = require('async');

var Zoologist = require('..').Zoologist;

var LeaderElection = require('..').LeaderElection;

var client = Zoologist.newClient('127.0.0.1:2181');

/*
 * This represents how many active elections you will need at one time.
 * The default is 10.
 */
client.setMaxListeners(1024);
client.start();

var election = new LeaderElection(client, '/my/path', 'my-id');

election.start(function(err, res){
  console.log(res);
});

election.on('groupLeader', function () {
  console.log('I am the leader, watch me lead!');
});

election.on('myLeader', function (myLeader) {
  console.log('My leader is', myLeader);
});

election.on('myFollower', function (myFollower) {
  console.log('My follower is', myFollower);
});

election.on('topologyChange', function (data) {
  console.log('Topology Change: ' + data);
});

election.on('error', function (err) {
  console.log('Error: ' + err);

  election.withdraw(function(err){
    console.log("Withdrawn the election!");

      election.start(function(err, res){
        console.log(res);
      });
  });
});





'use strict';

var Zoologist = require('..').Zoologist;

var LeaderElection = require('..').LeaderElection;

var client = Zoologist.newClient('127.0.0.1:2181');
client.start();

var election = new LeaderElection(client, '/my/path', 'my-id');

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

  // Restart election listener.
  election.start(function(err){
    console.log("Election restarting!");
  });
});

setInterval(function () {
  console.log(election.hasLeadership());
}, 5000);

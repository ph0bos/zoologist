'use strict';

var Zoologist      = require('..').Zoologist;
var LeaderElection = require('..').LeaderElection;

var election;

var client  = Zoologist.newClient('127.0.0.1:2181');

client.start();

client.on('connected', function () {
  election = new LeaderElection(client, '/my/path', 'my-id');

  election.start(function(err, node) {
    console.log(node);
  });

  election.on('gleader', function(e) {
    console.log('gleader: ' + e);
  });

  election.on('topology', function(data) {
    console.log('topology: ' + data);
  });

  election.on('error', function(err) {
    console.log('error: ' + err);
  });

});


//election.watch('/my/path');

setInterval(function() {
  console.log(election.hasLeadership());
}, 5000);

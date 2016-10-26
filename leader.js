var leader = require('leader');
var zkClient     = require('node-zookeeper-client');

// create a client and connect to ZK.
var client = zkClient.createClient("localhost:2181");

var voter = leader.createElection({
    zk: client,
    path: '/sss'
}, function(err) {
  console.log(err);
});

// i am the head of the chain
voter.on('gleader', function () {
  console.log('i am now the global election leader');
});

// the guy in front
voter.on('leader', function (myLeader) {
  console.log('my leader is', myLeader);
});

// the guy behind me
voter.on('follower', function (myFollower) {
  console.log('my follower is', myFollower);
});

voter.on('error', function (err) {
  console.error('got error', err);
});

voter.on('topology', function (top) {
  console.log('got election topology', top);
});

setInterval(function() {
  voter.vote();
}, 5000);

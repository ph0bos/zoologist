var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist      = require('..').Zoologist;
var LeaderElection = require('..').LeaderElection;

describe('LeaderElection', function() {

  beforeEach(function(){
    client  = Zoologist.newClient('127.0.0.1:2181');
    client.start();
  });

  it('should trigger a leader event when the leader is chosen', function(done) {

    var election = new LeaderElection(client, '/my/path', 'my-name');

    election.on('gleader', function () {
      election._isGLeader.should.be.true();
      done();
    });
  });

  it('should trigger only one leader event when the leader is chosen', function(done) {

    var election = new LeaderElection(client, '/my/path', 'my-name');

    election.on('gleader', function () {
      console.log('t1')
      done();
    });

    var election2 = new LeaderElection(client, '/my/path', 'my-name');

    election2.on('gleader', function () {
      console.log('t2')
    });
  });
});

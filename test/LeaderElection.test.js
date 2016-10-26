var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist      = require('..').Zoologist;
var LeaderElection = require('..').LeaderElection;

var leaderElection;

describe('LeaderElection', function() {

  beforeEach(function(done){
    client  = Zoologist.newClient('127.0.0.1:2181');
    client.start();

    client.once('connected', function () {
      leaderElection = new LeaderElection(client);

      done();
    });
  });

  it('start() should start an election', function(done) {

    leaderElection.start('/my/path', 'my-name', function(err, node) {
      console.log(err, node);

      leaderElection.watch('/my/path');

      leaderElection.on('event', function(e) {
        console.log('uo');
        console.log(e);
      });

      //done();
    });
  });
});

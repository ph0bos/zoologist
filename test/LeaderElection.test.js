var async   = require('async');
var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist      = require('..').Zoologist;
var LeaderElection = require('..').LeaderElection;

var client;

describe('LeaderElection', function() {
  this.timeout(15000);

  beforeEach(function(){
    client = Zoologist.newClient('127.0.0.1:2181');
    client.start();
  });

  it('should trigger a leader event when the leader is chosen', function(done) {

    var election = new LeaderElection(client, '/my/path', 'my-name');

    election.start(function(err, res){
      console.log("Start the election")
    });

    election.on('groupLeader', function () {
      election.hasLeadership().should.be.true();

      coolDown(done, [election]);
    });
  });

  it('should trigger multiple leader messages when elections are withdrawn', function(done) {

    var leaders = [];

    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election3 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    election3.start(function(err, res){
      console.log("Start the election")
    });

    election1.on('groupLeader', function() {
      leaders.push('Robert Baratheon');
    });

    election2.on('groupLeader', function() {
      leaders.push('Joffrey Baratheon');
    });

    election3.on('groupLeader', function() {
      leaders.push('Tommen Baratheon');
    });

    // Elect a new leader
    setTimeout(function(){
      leaders[0].should.equal('Robert Baratheon');
      leaders.length.should.equal(1);

      election1.hasLeadership().should.equal(true);
      election2.hasLeadership().should.equal(false);
      election3.hasLeadership().should.equal(false);

      election1.withdraw(function(err){
        console.log('Withdrawn Robert');
      });
    }, 2000);

    // Elect a new leader
    setTimeout(function(){
      leaders[1].should.equal('Joffrey Baratheon');
      leaders.length.should.equal(2);

      election1.hasLeadership().should.equal(false);
      election2.hasLeadership().should.equal(true);
      election3.hasLeadership().should.equal(false);

      election2.withdraw(function(err){
        console.log('Withdrawn Joffery');
      });
    }, 4000);

    // Elect a new leader
    setTimeout(function(){
      leaders[2].should.equal('Tommen Baratheon');
      leaders.length.should.equal(3);

      election1.hasLeadership().should.equal(false);
      election2.hasLeadership().should.equal(false);
      election3.hasLeadership().should.equal(true);

      election3.withdraw(function(err){
        console.log('Withdrawn Tommen');
      });
    }, 6000);

    // Remove the last leader
    setTimeout(function(){
      leaders.length.should.equal(3);

      election1.hasLeadership().should.equal(false);
      election2.hasLeadership().should.equal(false);
      election3.hasLeadership().should.equal(false);

      coolDown(done, [election1, election2, election3]);
    }, 8000);
  });

  it('should trigger new leader messages when new leaders are made', function(done) {
    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log(res);
    });

    election2.start(function(err, res){
      console.log(res);
    });

    election2.on('myLeader', function(leader) {
      leader.should.equal(election1.znode);

      coolDown(done, [election1, election2]);
    });
  });

  it('should trigger multiple leader messages when new leaders are made', function(done) {
    var leaders = [];

    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election3 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    election3.start(function(err, res){
      console.log("Start the election")
    });

    election2.on('myLeader', function(leader) {
      leaders.push(leader);
    });

    election3.on('myLeader', function(leader) {
      leaders.push(leader);
    });

    // Elect a new leader
    setTimeout(function(){
      leaders.length.should.equal(2);
      leaders[0].should.equal(election1.znode);
      leaders[1].should.equal(election2.znode);

      coolDown(done, [election1, election2, election3]);
    }, 2000);
  });

  it('should trigger new follow messages when new follows are made', function(done) {

    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    election1.on('myFollower', function(follower) {
      follower.should.equal(election2.znode);

      coolDown(done, [election1, election2]);
    });
  });

  it('should trigger multiple follow messages when new follows are made', function(done) {

    var followers = [];

    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election3 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    election3.start(function(err, res){
      console.log("Start the election")
    });

    election1.on('myFollower', function(follower) {
      followers.push(follower);
    });

    election2.on('myFollower', function(follower) {
      followers.push(follower);
    });

    // Elect a new leader
    setTimeout(function(){
      followers.length.should.equal(2);
      followers[0].should.equal(election2.znode);
      followers[1].should.equal(election3.znode);

      coolDown(done, [election1, election2, election3]);
    }, 2000);
  });

  it('should trigger new follow topology when new topologys are made', function(done) {
    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log(res);
    });

    election2.start(function(err, res){
      console.log(res);
    });

    election1.on('topologyChange', function(topology) {
      topology[0].should.equal(election1.znode);
      topology[1].should.equal(election2.znode);
      coolDown(done, [election1, election2]);
    });
  });

  it('should trigger multiple topology messages when new topologys are made', function(done) {
    var topologys = [];

    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election3 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    election3.start(function(err, res){
      console.log("Start the election")
    });

    election1.on('topologyChange', function(topology) {
      topologys.push(topology);
    });

    // Elect a new leader
    setTimeout(function(){
      election2.withdraw(function(err){});
      election3.withdraw(function(err){});
    }, 1000);

    // Elect a new leader
    setTimeout(function(){
      topologys[0].length.should.be.greaterThan(1);
      topologys[topologys.length -1 ].length.should.equal(1);
      coolDown(done, [election1, election2, election3]);
    }, 5000);
  });

  it('should trigger a error event when the client disconnects', function(done) {

    var election = new LeaderElection(client, '/my/path', 'my-name');

    election.start(function(err, res){
      console.log("Start the election")
    });

    election.on('groupLeader', function() {
      client.close();
    });

    election.on('error', function (err) {
      err.message.should.equal('disconnected from zk');
      coolDown(done, [election]);
    });
  });

  it('should trigger new leader messages when new leaders are made for different ids', function(done) {
    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'pink-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    var leaders = [];

    election1.on('groupLeader', function() {
      leaders.push("Robert");
    });

    election2.on('groupLeader', function() {
      leaders.push("Joffery");
    });

    setTimeout(function(){
      leaders.length.should.equal(2);
      leaders[0].should.equal('Robert');
      leaders[1].should.equal('Joffery');
      coolDown(done, [election1, election2]);
    }, 3000)
  });

  it('should withdraw and destroy all znodes', function(done) {

    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    var errors = [];

    election1.on('error', function(err) {
      errors.push(err);
    });

    election2.on('error', function(err) {
      errors.push(err);
    });

    setTimeout(function(){
      election1.destroy(function(err){
        console.log("Destroyed all nodes")
      })
    }, 2000);

    setTimeout(function(){
      console.log(errors);

      errors.length.should.equal(2);
      done();
    }, 4000)
  });

  it('should error when znode is forced deleted', function(done) {

    var election1 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');
    var election2 = new LeaderElection(client, '/seven/kingdoms', 'iron-throne');

    election1.start(function(err, res){
      console.log("Start the election")
    });

    election2.start(function(err, res){
      console.log("Start the election")
    });

    var errors = [];
    var leader;

    election1.on('error', function(err) {
      errors.push(err);
    });

    election2.on('groupLeader', function() {
      leader = 'Robert';
    });

    setTimeout(function(){
      client
        .getClient()
        .remove('/seven/kingdoms/iron-throne/' + election1.znode, function(err){
          console.log("Deleted znode 1")
        });
    }, 2000);

    setTimeout(function(){
      errors.length.should.equal(1);
      leader.should.equal('Robert');
      done();
    }, 3000)
  });
});

/**
 * Withdraw the created elections and wait for them to clear from ZK.
 *
 * @param done
 * @param elections
 */
function coolDown(done, elections){
  elections.forEach(function(e){
    e.withdraw(function(err){})
  });
  done();
}

var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist = require('..').Zoologist;

describe('Zoologist', function() {

  beforeEach(function(){
    zoologist = Zoologist.newClient('127.0.0.1:2181');
  });

  it('should create an instance of Zoologist when calling newClient()', function() {
    zoologist.should.be.a('object');
  });

  it('should start the framework when calling start()', function() {
    zoologist.start();
  });

  it('should be classified as started once start() has been called', function() {
    zoologist.start();
  });

  it('should be classified as not started if the start() function has not been called', function() {
    zoologist.getStarted().should.equal(false);
  });

  it('should be classified as not started if the close() function has been called', function(done) {
    zoologist.start();
    zoologist.once('connected', function() {
      zoologist.close();

      zoologist.once('disconnected', function() {
        zoologist.getStarted().should.equal(false);
        done();
      });
    });
  });

  it('should be classified as not started if the isConnected() function has been called', function(done) {
    zoologist.start();

    zoologist.once('connected', function() {
      zoologist.isConnected().should.equal(true);
      done();
    });
  });

  it('should close the framework when calling close()', function(done) {

    zoologist.start();

    zoologist.once('connected', function() {

      zoologist.close();
      zoologist.once('disconnected', function() {

        zoologist.isConnected().should.be.false();
        done();
      });
    });
  });
});

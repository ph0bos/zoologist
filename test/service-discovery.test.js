var mocha   = require('mocha');
var should  = require('chai').should()

var sd = require('..');

describe('service-discovery', function() {

  var client;

  beforeEach(function(done){
    client = sd.ServiceDiscovery.createServiceDiscoveryClient();
    done();
  });

  it('should create a service discovery client', function() {
    client.should.be.a('object');
  });

  it('should have a registerService function', function() {
    client.registerService.should.be.a('function');
  });

  it('should have a unregisterService function', function() {
    client.unregisterService.should.be.a('function');
  });

  it('should have a getServiceInstance function', function() {
    client.getServiceInstance.should.be.a('function');
  });

  it('getServiceInstance should return a random instance when called with an existing service path', function(done) {
    client.getServiceInstance('/services/content/tv/repository/v1', function(err, children, stat) {
      console.log(children.address, children.port);
      children.address.should.be.a('string');
      done();
    });
  });

  it('getServiceInstance should throw a NotFoundError when called with a non-existant service path', function(done) {
    client.getServiceInstance('/services/content/tv/repository/v2', function(err, children, stat) {
      err.should.be.a('object');
      done();
    });
  });
  
});

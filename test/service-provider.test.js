var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var ServiceProvider = require('..').ServiceProvider;

describe('ServiceProvider', function() {

  var serviceProvider;

  it('should create a service provider instance', function() {
  	var serviceProvider = new ServiceProvider('localhost:2181', 'services', 'content/tv/repository/v1');
  	serviceProvider.should.be.a('object');
  });

  it('getInstance() should return a random instance when called with an existing service path', function(done) {
    var serviceProvider = new ServiceProvider('localhost:2181', 'services', 'content/tv/repository/v1');

    serviceProvider.getInstance(function(err, service, stat) {
   	  console.log(JSON.stringify(service));
      service.address.should.be.a('string');
      service.port.should.be.a('number');
      done();
    });
  });

  it('getInstance() should throw a NotFoundError when called with a non-existant service path', function(done) {
    var serviceProvider = new ServiceProvider('localhost:2181', 'services', 'content/tv/repository/v2');

    serviceProvider.getInstance(function(err, service, stat) {
      err.should.be.a('object');
      done();
    });
  });
});
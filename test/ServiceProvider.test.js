var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist               = require('..').Zoologist;
var ServiceInstanceBuilder  = require('..').ServiceInstanceBuilder;
var ServiceProvider         = require('..').ServiceProvider;
var ServiceDiscoveryBuilder = require('..').ServiceDiscoveryBuilder;

describe('ServiceProvider', function() {

  beforeEach(function(done){
    client  = Zoologist.newClient('127.0.0.1:2181');
    client.start();

    client.once('connected', function () {
      serviceInstance =
        ServiceInstanceBuilder
          .builder()
          .address('localhost')
          .port(12345)
          .name('my/service/v1')
          .build();

      serviceDiscovery =
        ServiceDiscoveryBuilder
          .builder()
          .client(client)
          .thisInstance(serviceInstance)
          .basePath('services')
          .build();

      serviceProvider = new ServiceProvider(serviceDiscovery, 'my/service/v1', 'RoundRobin');

      serviceDiscovery.registerService(function onRegister(err, data) {
        done();
      });
    });
  });

  it('should create a service provider instance', function() {
    serviceProvider.should.be.a('object');
  });

  it('getInstance() should return a random instance when called with an existing service path', function(done) {
    serviceDiscovery.registerService(function (err, data) {
      serviceProvider.getInstance(function(err, service, stat) {
        service.address.should.be.a('string');
        service.port.should.be.a('number');
        done();
      });
    });
  });

  it('getInstance() should return a random instance when called with an existing service path that has a valid uriSpec', function(done) {
    serviceDiscovery.registerService(function (err, data) {
      serviceProvider.getInstance(function(err, service, stat) {
        service.uriSpec.should.equal('http://localhost:12345');
        done();
      });
    });
  });

  it('getInstance() should return a random instance when called with an existing service path that has a valid serviceUrl', function(done) {
    serviceDiscovery.registerService(function (err, data) {
      serviceProvider.getInstance(function(err, service, stat) {
        service.serviceUrl.should.equal('http://localhost:12345/my/service/v1');
        done();
      });
    });
  });

  it('getInstance() should throw a NotFoundError when called with a non-existant service path', function(done) {
    noServiceProvider = new ServiceProvider(serviceDiscovery, 'my/service/v3');

    noServiceProvider.getInstance(function(err, service, stat) {
      err.should.be.a('object');
      done();
    });
  });
});

  var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist               = require('..').Zoologist;
var ServiceInstanceBuilder  = require('..').ServiceInstanceBuilder;
var ServiceDiscoveryBuilder = require('..').ServiceDiscoveryBuilder;
var ServiceProviderBuilder  = require('..').ServiceProviderBuilder;

describe('ServiceDiscovery', function() {

  beforeEach(function(done){
    client  = Zoologist.newClient('127.0.0.1:2181');
    client.start();

    client.once('connected', function () {
      builder = ServiceDiscoveryBuilder.builder();

      serviceInstance =
        ServiceInstanceBuilder
          .builder()
          .address('localhost')
          .port(12345)
          .name('my/service/v1')
          .build();

      serviceDiscovery =
        builder
          .client(client)
          .thisInstance(serviceInstance)
          .basePath('services')
          .build();

      serviceProvider =
        ServiceProviderBuilder.builder()
          .serviceDiscovery(serviceDiscovery)
          .providerStrategy('RoundRobin')
          .build();

      serviceDiscovery.registerService(function onRegister(err, data) {
        done();
      });
    });
  });

  it('should create a service provider builder instance', function() {
    serviceProvider.should.be.a('object');
  });
});

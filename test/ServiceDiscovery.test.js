var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist               = require('..').Zoologist;
var ServiceInstanceBuilder  = require('..').ServiceInstanceBuilder;
var ServiceDiscoveryBuilder = require('..').ServiceDiscoveryBuilder;

describe('ServiceDiscovery', function() {

  beforeEach(function(done){
    client  = Zoologist.newClient('127.0.0.1:2181');
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

    done();
  });

  it('should create a service discovery instance', function() {
    serviceDiscovery.should.be.a('object');
  });

  it('should register a service when calling registerService()', function(done) {
    serviceDiscovery.registerService(function (err, data) {
      data.address.should.be.a('string');
      data.port.should.be.a('number');
      done();
    });
  });

  it('should unregister a service when calling unRegisterService()', function(done) {
    serviceDiscovery.registerService(function (err, data) {
      serviceDiscovery.unRegisterService(data.id, function(err, res) {
        should.not.exist(err);
        should.exist(res);
        done();
      });
    });
  });
});

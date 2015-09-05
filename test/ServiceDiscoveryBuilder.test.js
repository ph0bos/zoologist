var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist               = require('..').Zoologist;
var ServiceInstanceBuilder  = require('..').ServiceInstanceBuilder;
var ServiceDiscoveryBuilder = require('..').ServiceDiscoveryBuilder;

describe('ServiceDiscoveryBuilder', function() {

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
          .build();
          
      done();
    });
  });

  it('should instantiate an instance of ServiceDiscoveryBuilder when calling builder()', function() {
    builder.should.be.a('object');
  });

  it('should build an instance of ServiceDiscovery when calling build() with parameters', function() {
    builder
      .client(client)
      .thisInstance(serviceInstance)
      .basePath('services');

    var serviceDiscovery = builder.build();

    serviceDiscovery.should.be.a('object');
    serviceDiscovery.basePath.should.equal('/services');
    serviceDiscovery.client.should.be.a('object');
  });
});

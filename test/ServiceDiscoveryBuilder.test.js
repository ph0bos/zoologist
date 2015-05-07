var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist               = require('..').Zoologist;
var ServiceDiscoveryBuilder = require('..').ServiceDiscoveryBuilder;

describe('ServiceDiscoveryBuilder', function() {

  beforeEach(function(){
    client  = Zoologist.newClient('127.0.0.1:2181');
    builder = ServiceDiscoveryBuilder.builder();
  });

  it('should instantiate an instance of ServiceDiscoveryBuilder when calling builder()', function() {
    builder.should.be.a('object');
  });

  it('should build an instance of ServiceDiscovery when calling build() with parameters', function() {
  	builder.client(client);
  	builder.basePath('services');

  	var serviceDiscovery = builder.build();

    serviceDiscovery.should.be.a('object');
    serviceDiscovery.basePath.should.equal('/services');
    serviceDiscovery.client.should.be.a('object');
  });
});

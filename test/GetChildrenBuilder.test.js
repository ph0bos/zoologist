var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var Zoologist               = require('..').Zoologist;
var GetChildrenBuilder      = require('..').GetChildrenBuilder;
var ServiceProvider         = require('..').ServiceProvider;
var ServiceInstanceBuilder  = require('..').ServiceInstanceBuilder;
var ServiceDiscoveryBuilder = require('..').ServiceDiscoveryBuilder;

describe('GetChildrenBuilder', function() {
  beforeEach(function(done){
    client  = Zoologist.newClient('127.0.0.1:2181');
    client.start();

    client.once('connected', function () {
      serviceInstance =
        ServiceInstanceBuilder
          .builder()
          .address('localhost')
          .port(12345)
          .name('my/service/v2')
          .build();

      serviceDiscovery =
        ServiceDiscoveryBuilder
          .builder()
          .client(client)
          .thisInstance(serviceInstance)
          .basePath('services')
          .build();

      serviceProvider = new ServiceProvider(serviceDiscovery, 'my/service/v2');

      serviceDiscovery.registerService(function onRegister(err, data) {
        done();
      });
    });
  });

  it('should return an array of children when calling getChildren() for an existing path', function(done) {
    GetChildrenBuilder
      .builder()
      .client(client)
      .forPath('/services', function (err, children) {
        children.should.be.instanceof(Array);
        children.should.have.length.above(0);
        children.should.include('my/service/v2');
        done();
      });
  });

  it('should return a zero-length array of children when calling getChildren() on a non-existent path', function(done) {
    GetChildrenBuilder
      .builder()
      .client(client)
      .forPath('/noServices', function (err, children) {
        err.should.be.a('object');
        done();
      });
  });
});

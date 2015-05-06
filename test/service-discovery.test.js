var mocha   = require('mocha');
var mockery = require('mockery');
var should  = require('chai').should();

var ZooKeeperClient  = require('..').ZooKeeperClient;
var ServiceDiscovery = require('..').ServiceDiscovery;
var ServiceProvider  = require('..').ServiceProvider;

describe('ServiceDiscovery', function() {
  
  var serviceDiscovery;
  var zkClient = new ZooKeeperClient('localhost:2181', 'services');

  beforeEach(function(done){
    serviceDiscovery = new ServiceDiscovery('localhost:2181', 'services', 'test/service/path/v2');
    serviceProvider = new ServiceProvider(zkClient, 'test/service/path/v2');
    done();
  });

  it('should create a service discovery instance', function() {
    serviceDiscovery.should.be.a('object');
  });

  it('registerService() should return the created path', function(done) {
    serviceDiscovery.registerService('localhost', 8080, function (err, path) {
      serviceProvider.getInstance(function(err, service, stat) {
        console.log(JSON.stringify(service));
        service.address.should.be.a('string');
        service.port.should.be.a('number');
        done();
      });
    });
  });
});

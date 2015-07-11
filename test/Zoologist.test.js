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

  it('should close the framework when calling close()', function() {
    zoologist.close();
  });
});

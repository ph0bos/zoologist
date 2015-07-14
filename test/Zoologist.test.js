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

  it('should get return an array of children when calling getChildren()', function(done) {
    zoologist.start();

    zoologist.getChildren('/services', function (err, children) {
      children.should.be.instanceof(Array);
      children.should.have.length.above(0);
      children.should.include('my/service/v1');
      done();
    });
  });
});

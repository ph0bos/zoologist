'use strict';

/**
 * ServiceInstance.
 *
 * @module zoologist
 */

var DEFAULT_URI_SPEC = 
  {
    parts: [
      {
        value: 'scheme',
        variable: true
      },
      {
        value: '://',
        variable: false
      },
      {
        value: 'address',
        variable: true
      },
      {
        value: ':',
        variable: false
      },
      {
        value: 'port',
        variable: true
      }
    ]
  };

function ServiceInstance(uriSpec, address, port, name) {
  this.uriSpec = uriSpec || DEFAULT_URI_SPEC;
  this.address = address;
  this.port    = port;
  this.name    = name;
};

module.exports = ServiceInstance;

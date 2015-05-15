# Zoologist
A Curator-esque Node.js framework for ZooKeeper.

## Installation

    npm install zoologist --save

## Examples

### Service Registration

```javascript
'use strict';

var Zoologist               = require('zoologist').Zoologist;
var ServiceInstanceBuilder  = require('zoologist').ServiceInstanceBuilder;
var ServiceDiscoveryBuilder = require('zoologist').ServiceDiscoveryBuilder;

// Client
var zoologistClient = Zoologist.newClient('127.0.0.1:2181');

// Service Instance
var serviceInstance = ServiceInstanceBuilder
                        .builder()
                        .address('127.0.0.1')
                        .port(process.env.PORT)
                        .name('my/service/name/v1')
                        .build();

// Service Discovery
var serviceDiscovery = ServiceDiscoveryBuilder
                         .builder()
                         .client(zoologistClient)
                         .thisInstance(serviceInstance)
                         .basePath('services')
                         .build(); 

// Register a Service
serviceDiscovery.registerService(function onRegister(err, data) {
  console.log({ 
    id: data.id, 
    name: data.name, 
    address: data.address, 
    port: data.port 
  });
});

```

### Service Discovery

```javascript
'use strict';

var Zoologist               = require('zoologist').Zoologist;
var ServiceInstanceBuilder  = require('zoologist').ServiceInstanceBuilder;
var ServiceDiscoveryBuilder = require('zoologist').ServiceDiscoveryBuilder;

// Client
var zoologistClient = Zoologist.newClient('127.0.0.1:2181');

// Service Instance
var serviceInstance = ServiceInstanceBuilder
                        .builder()
                        .address('127.0.0.1')
                        .port(process.env.PORT)
                        .name('my/service/name/v1')
                        .build();

// Service Discovery
var serviceDiscovery = ServiceDiscoveryBuilder
                         .builder()
                         .client(zoologistClient)
                         .thisInstance(serviceInstance)
                         .basePath('services')
                         .build(); 

// Service Provider
var serviceProvider = serviceDiscovery.serviceProviderBuilder()
                        .serviceName('my/service/name/v1')
                        .build();

// Discover available Services and provide an instance
serviceProvider.getInstance(function onInstanceReturn(err, data) {
  console.log({ 
    id: data.id, 
    name: data.name, 
    address: data.address, 
    port: data.port,
    serviceUrl: serviceUrl 
  });
}); 

```
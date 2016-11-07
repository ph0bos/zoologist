# Zoologist
A Curator-esque ZooKeeper framework for Node.js.

[![NPM](https://nodei.co/npm/zoologist.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/zoologist/)

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

// Start the client (connect to ZooKeeper)
zoologistClient.start();

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

// Start the client (connect to ZooKeeper)
zoologistClient.start();

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

// Service Provider (providerStrategy: 'RoundRobin' or 'Random')
var serviceProvider = serviceDiscovery.serviceProviderBuilder()
                        .serviceName('my/service/name/v1')
                        .providerStrategy('RoundRobin')
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

### Leadership Election

```javascript
'use strict';

var async = require('async');

var Zoologist = require('..').Zoologist;

var LeaderElection = require('..').LeaderElection;

var client = Zoologist.newClient('127.0.0.1:2181');

/*
 * This represents how many active elections you will need at one time.
 * The default is 10.
 */
client.setMaxListeners(1024);
client.start();

var election = new LeaderElection(client, '/my/path', 'my-id');

election.start(function(err, res){
  console.log(res);
});

election.on('groupLeader', function () {
  console.log('I am the leader, watch me lead!');
});

election.on('myLeader', function (myLeader) {
  console.log('My leader is', myLeader);
});

election.on('myFollower', function (myFollower) {
  console.log('My follower is', myFollower);
});

election.on('topologyChange', function (data) {
  console.log('Topology Change: ' + data);
});

election.on('error', function (err) {
  console.log('Error: ' + err);

  election.withdraw(function(err){
    console.log("Withdrawn the election!");

      election.start(function(err, res){
        console.log(res);
      });
  });
});

```

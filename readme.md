Node Architect Consumer
====================

[![Build Status](https://semaphoreapp.com/api/v1/projects/d0e9e9f4-05b7-4cf3-89d7-2f008fddedb0/359584/badge.png)](https://semaphoreapp.com/tdfairbrother/node-architect-consumer)

[![Coverage Status](https://coveralls.io/repos/tdfairbrother/node-architect-consumer/badge.svg)](https://coveralls.io/r/tdfairbrother/node-architect-consumer)


This module is exposed as an [Architect](https://github.com/c9/architect) plugin.

Wraps the sqs-consumer module and provides it as a service.

You can start and stop the worker by calling services.consumer.workers[0].start/stop()

Calling services.consumer.workers[0].handleMessage(message, done) will trigger a fake message to go through the system (useful for testing).


```sh
npm install
```

To run tests
```sh
npm test
```
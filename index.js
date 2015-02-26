var Consumer = require('sqs-consumer');

module.exports = function(options, imports, register){
    var log = imports.log('consumer');

    log.info('loading...');

    function Worker(callback, errorHandler) {
        log.info('Initialising new consumer');

        this.callback = callback;
        this.errorHandler = errorHandler ||
                            function(err) {
                                throw err;
                            };

        return this;
    }

    Worker.prototype = {
        start: function() {
            log.info('Start consumer');
            this._initSqsConsumer();
            this._consumer.start();
        },
        stop: function() {
            log.info('Stop consumer');
            this._consumer.stop();
        },
        handleMessage: function(message, done){
            log.info('New consumer message');
            this.callback(message, done);
        },
        _parseAndHandleMessage: function(message, done){
            log.info('Parse consumer message');
            var body = JSON.parse(message.Body);
            this.handleMessage(body, done);
        },
        _initSqsConsumer: function() {
            if (this._consumer) {
                return;
            }

            log.info('Initialising new sqs-consumer');

            this._consumer = new Consumer({
                queueUrl: options.queue,
                region: options.region,
                handleMessage: this._parseAndHandleMessage.bind(this),
                batchSize: options.batchSize || 1
            });

            this._consumer.on('error', this.errorHandler.bind(this));
        }
    };

    var workers = [];

    var exports = {
        consumer: {
            'new': function(callback, errorHandler) {
                var worker = new Worker(callback, errorHandler);
                workers.push(worker);
                return worker;
            },
            workers: workers,
            Worker: Worker
        }
    };

    register(null, exports);

};
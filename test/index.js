'use strict';

var expect = require('expect.js');
var sinon = require('sinon');
var proxyquire = require('proxyquire').noPreserveCache();
var util = require('util');
var EventEmitter = require('events').EventEmitter;

// Mock sqs-consumer lib
function Consumer(props) {
    this.props = props;
}

// Sqs-consumer is an event emitter
util.inherits(Consumer, EventEmitter);

Consumer.prototype.start = function() {}
Consumer.prototype.stop = function() {}

var mock = {
    'sqs-consumer': Consumer
};

var plugin = proxyquire('../', mock);
var consumer, worker, callback, errorCallback;


describe('consumer', function(){

    beforeEach(function(done){
        plugin({
            // Options
            queue: 'my queue',
            region: 'my region',
            batchSize: 10000
        }, {
            // Imports
            log: require('node-architect-log/mock')
        },
            // Register
            function(err, services) {
                if (err) throw err;

                // Access to exported services
                consumer = services.consumer;

                callback = sinon.stub();
                errorCallback = sinon.stub();

                worker = consumer.new(callback, errorCallback);
                done();
            });
    });

    describe('.new', function() {

        beforeEach(function(){
            worker.start();
        });

        it('returns an an instance of Worker', function() {
            expect(worker).to.be.a(consumer.Worker);
        });

        describe('Worker#start', function() {
            it('proxies to consumer.start()', function() {
                var startStub = sinon.stub(Consumer.prototype, 'start');
                worker.start();
                expect(startStub.callCount).to.be(1);
                startStub.restore();
            });

            it('worker.consumer is an instance of sqs-consumer', function() {
                expect(worker._consumer).to.be.a(Consumer);
            });

            describe('initialises sqs-consumer with', function() {
                it('queueUrl from the plugin options', function() {
                    expect(worker._consumer.props.queueUrl).to.be('my queue');
                });

                it('region from the plugin options', function() {
                    expect(worker._consumer.props.region).to.be('my region');
                });

                it('batchSize from the plugin options', function() {
                    expect(worker._consumer.props.batchSize).to.be(10000);
                });
            });

            describe('attaches an error handler', function() {
                beforeEach(function(){
                    worker._consumer.emit('error', 'test error');
                });

                it('that gets called if an error is triggered', function() {
                    expect(errorCallback.callCount).to.be(1);
                });

                it('with the error as an argument', function() {
                    expect(errorCallback.calledWith('test error')).to.be(true);
                });

                it('and the context set to the worker instance', function() {
                    expect(errorCallback.calledOn(worker)).to.be(true);
                });
            });

        });

        describe('Worker#stop', function() {
            it('proxies to consumer.stop()', function() {
                var stopStub = sinon.stub(Consumer.prototype, 'stop');
                expect(stopStub.callCount).to.be(0);
                worker.stop();
                expect(stopStub.callCount).to.be(1);
                stopStub.restore();
            });
        });

        describe('#handleMessage', function() {
            it('callback is called with the message.Body jsonified and the done callback', function() {
                var done = sinon.stub();
                worker._consumer.props.handleMessage({ Body:'{"test":"json"}' }, done);
                expect(callback.calledWith({"test":"json"}, done)).to.be(true);
            });
        });

    });
});
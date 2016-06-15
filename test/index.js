var printConsoleMessages = false;
var fakeEnv = {
    logger: {
        info: function() {
            if (printConsoleMessages) {
                console.log.apply(this, arguments);
            }
            fakeEnv.infoMessage = arguments;
            fakeEnv.numberOfInfoMessages++;
        },
        debug: function() {
            if (printConsoleMessages) {
                console.log.apply(this, arguments);
            }
            fakeEnv.debugMessage = arguments;
            fakeEnv.numberOfDebugMessages++;
        },
        error: function() {
            if (printConsoleMessages) {
                console.log.apply(this, arguments);
            }
            fakeEnv.errorMessage = arguments;
            fakeEnv.numberOfErrorMessages++;
        }
    },
    infoMessage: [],
    debugMessage: [],
    errorMessage: [],
    numberOfInfoMessages: 0,
    numberOfDebugMessages: 0,
    numberOfErrorMessages: 0,
    require: require
};

var Promise = require("bluebird");
var common = require("../lib")(fakeEnv);


describe("Testing the base device functions", function() {
    var fakeDevice, base;

    beforeEach(function(done) {
        setTimeout(function() {
            fakeDevice = {
                debug: true,
                events: {},
                emit: function(attributeName, attributeValue) {
                    fakeDevice.events[attributeName] = attributeValue
                }
            };
            base = common.base(fakeDevice, "test");
            done();
        }, 1);
    });

    it("shall reject with an error message (rejectWithError) and stack trace", function(done) {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        var promise = new Promise(function (resolve, reject) {
            base.rejectWithError(reject, "testme");
        });
        promise.catch(function(error) {
            // prints 2 messages on debug as it produces an additional stacktrace
            expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 2);
            done();
        });

    });

    it("shall reject with error message 'Unknown' (rejectWithError) and stack trace", function(done) {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        var promise = new Promise(function (resolve, reject) {
            base.rejectWithError(reject);
        });
        promise.catch(function(error) {
            // prints 2 messages on debug as it produces an additional stacktrace
            expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 2);
            expect(error).toEqual("Error: Unknown");
            done();
        });

    });

    it("shall reject with an error message (rejectWithErrorString) and stack trace", function(done) {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        var promise = new Promise(function (resolve, reject) {
            base.rejectWithErrorString(reject, "testme");
        });
        promise.catch(function(error) {
            // prints 2 messages on debug as it produces an additional stacktrace
            expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 2);
            done();
        });

    });

    it("shall reject with an error message (rejectWithErrorString) without stack trace", function(done) {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        var promise = new Promise(function (resolve, reject) {
            fakeDevice.debug = false;
            base.rejectWithErrorString(reject, "testme");
            fakeDevice.debug = true;
        });
        promise.catch(function(error) {
            expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);
            done();
        });

    });

    it("shall print an error message without rejection (rejectWithErrorString)", function(done) {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        var promise = new Promise(function (resolve, reject) {
            base.rejectWithErrorString(null, "testme");
            expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 2);
            done();
        });
        promise.catch(function(error) {
            expect(true).toBe(false);
        });
    });

    it("shall print an error message for no error passed (rejectWithErrorString)", function(done) {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        var promise = new Promise(function (resolve, reject) {
            base.rejectWithErrorString();
            expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 2);
            done();
        });
        promise.catch(function(error) {
            expect(true).toBe(false);
        });
    });

    it("shall return the entity name", function() {
        expect(base._entityName("X")).toBe("[test#X]");
    });

    it("shall print an info message", function() {
        var numberOfMessages = fakeEnv.numberOfInfoMessages;
        base.info("testme");
        expect(fakeEnv.numberOfInfoMessages).toBe(numberOfMessages + 1);
        expect(fakeEnv.infoMessage[0]).toBe("[test] testme");

        numberOfMessages = fakeEnv.numberOfInfoMessages;
        base.info();
        expect(fakeEnv.numberOfInfoMessages).toBe(numberOfMessages + 1);
        expect(fakeEnv.infoMessage[0]).toBe("[test]");

        numberOfMessages = fakeEnv.numberOfInfoMessages;
        fakeDevice.id = "1";
        base.info("testme");
        expect(fakeEnv.numberOfInfoMessages).toBe(numberOfMessages + 1);
        expect(fakeEnv.infoMessage[0]).toBe("[test#1] testme");
        fakeDevice.id = undefined;
    });

    it("shall print a debug message with debug enabled", function() {
        var numberOfMessages = fakeEnv.numberOfDebugMessages;
        base.debug("testme");
        expect(fakeEnv.numberOfDebugMessages).toBe(numberOfMessages + 1);
        expect(fakeEnv.debugMessage[0]).toBe("[test] testme");

        numberOfMessages = fakeEnv.numberOfDebugMessages;
        base.debug();
        expect(fakeEnv.numberOfDebugMessages).toBe(numberOfMessages + 1);
        expect(fakeEnv.debugMessage[0]).toBe("[test]");

        numberOfMessages = fakeEnv.numberOfDebugMessages;
        fakeDevice.id = "1";
        base.debug("testme");
        expect(fakeEnv.numberOfDebugMessages).toBe(numberOfMessages + 1);
        expect(fakeEnv.debugMessage[0]).toBe("[test#1] testme");
        fakeDevice.id = undefined;
    });

    it("shall not print a debug message with debug disabled", function() {
        var numberOfMessages = fakeEnv.numberOfDebugMessages;
        fakeDevice.debug = false;
        base.debug("testme");
        expect(fakeEnv.numberOfDebugMessages).toBe(numberOfMessages);
        fakeDevice.debug = true;
    });

    it("shall print same error message twice with debug enabled", function() {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.error("testme");
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);

        numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.error("testme");
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);

        numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.error();
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1)
    });

    it("shall print a stack trace", function() {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.stack();
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);

        numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.stack(new Error("test"));
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);
    });

    it("shall print same error message once with debug disabled", function() {
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.error("testme");
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);

        fakeDevice.debug = false;
        numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.error("testme");
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages);
        fakeDevice.debug = true;
    });

    it("shall print same error message twice if reset", function() {
        fakeDevice.debug = false;
        base.resetLastError();
        var numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.error("testme");
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);

        base.resetLastError();
        numberOfMessages = fakeEnv.numberOfErrorMessages;
        base.error("testme");
        expect(fakeEnv.numberOfErrorMessages).toBe(numberOfMessages + 1);
        fakeDevice.debug = true;
    });


    it("shall set the attribute value", function() {
        fakeDevice.events = {};
        base.setAttribute("testme", 4711);

        expect(fakeDevice._testme).toBe(4711);
        expect(fakeDevice.events.testme).toBe(4711);
    });

    it("shall not trigger an event if attribute is set to the same value", function() {
        base.setAttribute("testme", 4711);
        fakeDevice.events = {};
        base.setAttribute("testme", 4711);

        expect(fakeDevice._testme).toBe(4711);
        expect(fakeDevice.events.testme).toBeUndefined();
    });

    it("shall schedule an update", function(done) {
        var startTime = process.hrtime();
        function update() {
            var deltaTime = process.hrtime(startTime)
            expect(deltaTime[0] * 1e6 + deltaTime[1] / 1e3).not.toBeLessThan(500);
            done();
        }

        base.scheduleUpdate(update, 500);
    });

    it("shall not schedule an update if interval is 0", function(done) {
        function update() {
            expect(true).toBe(false);
            done();
        }
        base.scheduleUpdate(update, 0);
        base.debounce(500, function() {
            done()
        })
    });

    it("shall cancel an update", function() {
        function update() {
        }
        base.scheduleUpdate(update, 500);
        base.cancelUpdate();
        expect(fakeDevice.__timeoutObject).toBe(null);
    });

    it("shall not cancel void", function() {
        fakeDevice.__timeoutObject = null;
        base.cancelUpdate();
        expect(fakeDevice.__timeoutObject).toBe(null);
    });

    it("shall normalize the given value", function() {
        expect(base.normalize(100, 99, 101)).toBe(100);
        expect(base.normalize(100, 100, 101)).toBe(100);
        expect(base.normalize(99, 100, 101)).toBe(100);
        expect(base.normalize(102, 100, 101)).toBe(101);
        expect(base.normalize(99, 100)).toBe(100);
    });

    it("shall produce a unique array", function() {
        var a = [];
        expect(base.unique(a).length).toBe(0);

        a = [1];
        expect(base.unique(a).length).toBe(1);

        a = [1,1];
        expect(base.unique(a).length).toBe(1);

        a = [1,2];
        expect(base.unique(a).length).toBe(2);

        a = [1,1,1,2,2,2,1,1,1,1,1,1,2];
        expect(base.unique(a).length).toBe(2);

        a = [1,1,1,2,2,2,7,1,1,1,7,1,1,1,2];
        expect(base.unique(a).length).toBe(3);
    });

    it("shall called debounced function only once", function(done) {
        function debouncer(id) {
            return new Promise(function (resolve, reject) {
                for (var x = 0;x < 10; ++x) {
                    if (id != null) {
                        base.debounce(id, 100, function() {
                            resolve(x);
                        })
                    }
                    else {
                        base.debounce(100, function() {
                            resolve(x);
                        })
                    }

                }
            });
        }
        debouncer().then(function(x) {
           expect(x).toBe(10);
        }.bind(this));

        debouncer("test").then(function(x) {
            expect(x).toBe(10);
            done()
        }.bind(this));
        fakeDevice.__timerIds["test"] = null;
    });

    it("shall continue if promise has been settled", function(done) {
        var promise = new Promise(function (resolve, reject) {
            base.debounce(50, function() {
                resolve();
            })
        });
        common.settled(promise).then(function() {
            done();
        })
    });

    it("shall map a series of promises and continue then", function(done) {
        var sum = 0;
        common.series([1,2,3], function(id) {
            sum+= id;
            return Promise.resolve()
        }).then(function() {
            expect(sum).toBe(6);
            done();
        })
    });
});


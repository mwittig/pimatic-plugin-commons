module.exports = function(env) {
  var Promise;
  Promise = env.require('bluebird');
  return {
    settled: function(promise) {
      return Promise.settle([promise]);
    },
    series: function(input, mapper) {
      return Promise.mapSeries(input, mapper);
    },
    base: function(device, deviceClassName) {
      var members;
      return members = {
        rejectWithError: (function(_this) {
          return function(reject, error) {
            var message;
            message = (deviceClassName + " Error on device " + device.id + ": ") + error;
            env.logger.error(message, device.debug ? (new Error).stack : "");
            if (reject != null) {
              return reject(message);
            }
          };
        })(this),
        debug: function() {
          var mainArguments, ref;
          mainArguments = Array.prototype.slice.call(arguments);
          if (mainArguments.length > 0) {
            mainArguments[0] = "[" + deviceClassName + "] " + mainArguments[0];
          }
          if (device.debug) {
            return (ref = env.logger).debug.apply(ref, mainArguments);
          }
        },
        setAttribute: function(attributeName, value) {
          if (device['_' + attributeName] !== value) {
            device['_' + attributeName] = value;
            return device.emit(attributeName, value);
          }
        },
        cancelUpdate: function() {
          if (device.__timeoutObject != null) {
            return clearTimeout(device.__timeoutObject);
          }
        },
        scheduleUpdate: function(func, interval) {
          members.cancelUpdate();
          if (interval > 0) {
            members.debug("Next Request in " + interval + " ms");
            return device.__timeoutObject = setTimeout((function(_this) {
              return function() {
                device.__timeoutObject = null;
                return func.call(device);
              };
            })(this), interval);
          }
        },
        normalize: function(value, lowerRange, upperRange) {
          if (upperRange) {
            return Math.min(Math.max(value, lowerRange), upperRange);
          } else {
            return Math.max(value(lowerRange));
          }
        }
      };
    }
  };
};

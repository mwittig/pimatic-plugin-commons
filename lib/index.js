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
        _entityName: function(id) {
          if (id == null) {
            id = device.id;
          }
          return ("[" + deviceClassName) + (id != null ? "#" + id + "]" : "]");
        },

        /*
          Outputs an error message and optionally rejects a Promise on return. If
            the debug property is set on the device a stack trace is output.
          @param {Function} reject - function to reject a promise on return, may be null
          @param {Error} error  - error object
         */
        rejectWithError: function(reject, error) {
          var message;
          message = "Error: " + error;
          members.error(message);
          if (device.debug === true) {
            members.stack(error);
          }
          if (reject != null) {
            return reject(message);
          }
        },

        /*
          Outputs an debug message with an arbitrary list of arguments if
          the debug property is set. The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param ...
         */
        debug: function() {
          var mainArguments, ref;
          if (device.debug === true) {
            mainArguments = Array.prototype.slice.call(arguments);
            if (mainArguments.length > 0) {
              mainArguments[0] = members._entityName() + ' ' + mainArguments[0];
            } else {
              mainArguments[0] = members._entityName();
            }
            return (ref = env.logger).debug.apply(ref, mainArguments);
          }
        },

        /*
          Outputs an error message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param ...
         */
        error: function() {
          var mainArguments, ref;
          if (device.debug === true || (device.__lastError == null) || device.__lastError !== arguments[0] + "") {
            device.__lastError = arguments[0] + "";
            mainArguments = Array.prototype.slice.call(arguments);
            if (mainArguments.length > 0) {
              mainArguments[0] = members._entityName() + ' ' + mainArguments[0];
            } else {
              mainArguments[0] = members._entityName();
            }
            return (ref = env.logger).error.apply(ref, mainArguments);
          }
        },

        /*
          Reset the lastError guard which inhibits the repeated output of the same error message
         */
        resetLastError: function() {
          return device.__lastError = "";
        },

        /*
          Outputs an error message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param {Error}  [error] Error object, or null
         */
        stack: function(error) {
          if (error == null) {
            error = null;
          }
          return env.logger.error((error != null ? error.stack : void 0) != null ? error.stack : (new Error).stack);
        },

        /*
          Set the named attribute to the given value. The attribute
          value must be kept in a member variable named _<attributeName>
          where <attributeName> is a place holder for the attribute name.
          @param {String} attributeName - the attribute name
          @param {Any} value - the attribute value
         */
        setAttribute: function(attributeName, value) {
          if (device['_' + attributeName] !== value) {
            device['_' + attributeName] = value;
            return device.emit(attributeName, value);
          }
        },

        /*
          Cancel a scheduled update.
         */
        cancelUpdate: function() {
          if (device.__timeoutObject != null) {
            clearTimeout(device.__timeoutObject);
            return device.__timeoutObject = null;
          }
        },

        /*
          Schedule an update. The given member function of the device
          is called after 'interval' milliseconds. Repeated call will
          remove any previous schedule.
          @param {Function} func - update function to be called
          @param {Number} interval - interval in milliseconds
         */
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
          if (upperRange != null) {
            return Math.min(Math.max(value, lowerRange), upperRange);
          } else {
            return Math.max(value, lowerRange);
          }
        },
        unique: function(array) {
          var i, key, output, ref, results, value;
          if (array.length < 2) {
            return array;
          }
          output = {};
          for (key = i = 0, ref = array.length; 0 <= ref ? i < ref : i > ref; key = 0 <= ref ? ++i : --i) {
            output[array[key]] = array[key];
          }
          results = [];
          for (key in output) {
            value = output[key];
            results.push(value);
          }
          return results;
        },

        /*
          Schedules a given function which will not be called as long as it continues to be invoked.
          The function will be called after it stops being called for the given delay milliseconds. To be able
          to manage multiple, different debounce tasks an id string can be provided to identify the debounce task.
         */
        debounce: function(id, delay, fn) {
          if (typeof id === 'number' && typeof fn === 'undefined') {
            fn = delay;
            delay = id;
            id = 'default';
          }
          if (device.__timerIds == null) {
            device.__timerIds = {};
          }
          if (device.__timerIds[id] != null) {
            clearTimeout(device.__timerIds[id]);
            device.__timerIds[id] = null;
          }
          device.__timerIds[id] = setTimeout((function(_this) {
            return function() {
              if (device.__timerIds[id] === null) {
                members.debug("Timer id is null");
              }
              device.__timerIds[id] = null;
              return fn.call(device);
            };
          })(this), delay);
          return Promise.resolve();
        }
      };
    }
  };
};

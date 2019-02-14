
/*
  @class pimatic-plugin-commons API
 */
var hasProp = {}.hasOwnProperty,
  slice = [].slice;

module.exports = function(env) {
  var Promise, _intervalId, common;
  Promise = env.require('bluebird');
  _intervalId = 0;
  return common = {
    _periodicTimers: {},

    /*
      Waits for a given promise to be resolved or rejected.
      @param {Promise} promise - the promise to wait for
     */
    settled: function(promise) {
      return promise.reflect();
    },

    /*
      Maps an array of promises or items to a mapping function resolving or
      rejection a promise. The mapping function will be called sequentially
      for each array item.
      @param {Array} input - an array of promises or items
      @param {Function} mapper - the mapping function
     */
    series: function(input, mapper) {
      return Promise.mapSeries(input, mapper);
    },

    /*
      Calls a function repeatedly, with a fixed time delay between each call
      to that function. It is similar to setInterval(), but makes an immediate
      function call at the next ick rather than starting with timeout delay.
      Moreover, it adjust the delay time to dispatch periodic calls with higher
      accuracy than setInterval() does.
      @param {Function} func - the function to be called
      @param {Number} delay - delay in milliseconds
      @return {String} the timer id
     */
    setPeriodicTimer: function(func, delay) {
      var id, taskHandler, timerData;
      id = "setPeriodicTimer." + (++_intervalId);
      timerData = {
        func: func,
        delay: delay,
        target: 0,
        started: false
      };
      taskHandler = (function(func, delay) {
        var adjust, elapsed;
        if (!timerData.started) {
          timerData.started = true;
          common._periodicTimers[id] = setTimeout(taskHandler, timerData.target);
        } else {
          if (timerData.target === 0) {
            adjust = 0;
            timerData.target = timerData.delay;
            timerData.startTime = Date.now() - timerData.delay;
          } else {
            elapsed = Date.now() - timerData.startTime;
            adjust = timerData.target - elapsed;
          }
          timerData.target += timerData.delay;
          if (common._periodicTimers.hasOwnProperty(id)) {
            common._periodicTimers[id] = setTimeout(taskHandler, timerData.delay + adjust);
            timerData.func();
          }
        }
        return id;
      });
      return taskHandler(func, delay);
    },

    /*
      Takes a given timer id returned by a setPeriodicTimer()
      call and clears the timer. Invalid timer ids are ignored.
      @param {String} id - the timer id
      @return {String} the timer id
     */
    clearPeriodicTimer: function(id) {
      if (common._periodicTimers.hasOwnProperty(id)) {
        clearTimeout(common._periodicTimers[id]);
        return delete common._periodicTimers[id];
      }
    },

    /*
      Clears all active periodic timers.
     */
    clearAllPeriodicTimers: function() {
      var k, ref, results, v;
      ref = common._periodicTimers;
      results = [];
      for (k in ref) {
        if (!hasProp.call(ref, k)) continue;
        v = ref[k];
        clearTimeout(v);
        results.push(delete common._periodicTimers[k]);
      }
      return results;
    },

    /*
      Returns the number of active period timers.
     */
    activePeriodicTimers: function() {
      return Object.keys(common._periodicTimers).length;
    },

    /*
      Base object providing device helper functions. **The functions described
      in the remainder of this document are members of base**.
      @param  {Object} device - the device object
      @param  {String} deviceName - the device name to be used for log output
     */
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
          Outputs an error message and optionally rejects a Promise on return.
          If the debug property is set on the device a stack trace is output.
          @param {Function} reject - function to reject a promise on return,
                                     may be null
          @param {Error} error  - error object
          @param {String} [customMessage]  - a custom message to be used
                                             as prefix to the error message
         */
        rejectWithErrorString: function(reject, error, customMessage) {
          var message, ref;
          if (error == null) {
            error = "Unknown";
          }
          if (customMessage == null) {
            customMessage = null;
          }
          message = "" + ((ref = error.message) != null ? ref : error);
          if (message.match(/^Error:\ /) == null) {
            message = "Error: " + message;
          }
          if (customMessage != null) {
            message = customMessage + ": " + message;
          }
          members.error(message);
          if (device.debug === true) {
            members.stack(error);
          }
          if (reject != null) {
            return reject(message);
          }
        },

        /*
          Same as rejectWithErrorString, but has been deprecated
          @param {Function} reject - function to reject a promise on return,
                                     may be null
          @param {Error} error  - error object
          @deprecated
         */
        rejectWithError: function(reject, error) {
          if (error == null) {
            error = "Unknown";
          }
          return members.rejectWithErrorString(reject, error);
        },

        /*
          Outputs an info message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName' and optionally
          the 'id' property (if present) of the device.
          @param ...
         */
        info: function() {
          var args, ref;
          args = Array.prototype.slice.call(arguments);
          if (args.length > 0) {
            args[0] = members._entityName() + ' ' + args[0];
          } else {
            args[0] = members._entityName();
          }
          return (ref = env.logger).info.apply(ref, args);
        },

        /*
          Outputs a debug message with an arbitrary list of arguments if
          the debug property is set. The output is prefixed with the
          'deviceClassName' and optionally the 'id' property (if present)
          of the device.
          @param ...
         */
        debug: function() {
          var args, ref;
          if (device.debug === true) {
            args = Array.prototype.slice.call(arguments);
            if (args.length > 0) {
              args[0] = members._entityName() + ' ' + args[0];
            } else {
              args[0] = members._entityName();
            }
            return (ref = env.logger).debug.apply(ref, args);
          }
        },

        /*
          Outputs an error message at a given log level followed by an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param level - one of "error", "info", "debug"
          @param ...
         */
        logErrorWithLevel: function() {
          var args, level, ref;
          level = arguments[0] + "";
          if ((level === "error" || level === "warn" || level === "info") && (device.debug === true || (device.__lastError == null) || device.__lastError !== arguments[1] + "")) {
            device.__lastError = arguments[1] + "";
            args = Array.prototype.slice.call(arguments);
            args.shift();
            if (args.length > 0) {
              args[0] = members._entityName() + ' ' + args[0];
            } else {
              args[0] = members._entityName();
            }
            return (ref = env.logger)[level].apply(ref, args);
          }
        },

        /*
          Outputs an error message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param ...
         */
        error: function() {
          return members.logErrorWithLevel.apply(members, ["error"].concat(slice.call(arguments)));
        },

        /*
          Reset the lastError guard which inhibits the repeated
          output of the same error message
         */
        resetLastError: function() {
          return device.__lastError = "";
        },

        /*
          Outputs a stack trace if debug is enabled.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param {Error}  [error] Error object, or null
         */
        stack: function(error) {
          if (error == null) {
            error = null;
          }
          return env.logger.error(((error != null ? error.stack : void 0) != null ? error.stack : (new Error).stack));
        },

        /*
          Set the named attribute to the given value. The attribute
          value must be kept in a member variable named `_<attributeName>`
          where `<attributeName>` is a place holder for the attribute name.
          Note, a given undefined or null value is ignored.
        
          The optional `discrete` parameter can be used to optimize the update
          behaviour of discrete attribute value, i.e., the attribute value is
          only updated if the value has been changed.
          @param {String} attributeName - the attribute name
          @param {Any} value - the attribute value
          @param [Boolean} [discrete=false] - True if attribute value is
          discrete, e.g., a switch state. False, otherwise.
         */
        setAttribute: function(attributeName, value, discrete) {
          if (discrete == null) {
            discrete = false;
          }
          if ((value != null) && !discrete || device['_' + attributeName] !== value) {
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
          @param {Number} interval - interval in milliseconds. 0 will
                          trigger an immediate update
          @param [...] - additional parameters which are passed through
                         to the function specified by func once the
                         timer expires
         */
        scheduleUpdate: function(func, interval) {
          var args;
          members.cancelUpdate();
          if (typeof func === 'undefined') {
            throw new Error("Missing function parameter");
          }
          if (typeof interval === 'undefined' || interval < 0) {
            throw new Error('Missing or invalid interval parameter');
          } else {
            members.debug("Next Request in " + interval + " ms");
            args = Array.prototype.splice.call(arguments, 2);
            return device.__timeoutObject = setTimeout(function() {
              device.__timeoutObject = null;
              return func.apply(device, args);
            }, interval);
          }
        },

        /*
          Normalize a given value to match the given lowerRange and
          upperRange. The latter is optional.
          @param {Number} value - the value
          @param {Number} lowerRange - the lower range
          @param {Number} [upperRange] - the upper range
         */
        normalize: function(value, lowerRange, upperRange) {
          if (upperRange != null) {
            return Math.min(Math.max(value, lowerRange), upperRange);
          } else {
            return Math.max(value, lowerRange);
          }
        },

        /*
          Removes duplicates from a given array of strings or number items. The
          result is returned to a new array. The used algorithm has a linear
          complexity of O(2n) in the worst case.
          @param {Array} array - the input array
          @return {Array} the resulting array with unique items
         */
        unique: function(array) {
          var i, key, output, ref, results, value;
          if (array.length < 2) {
            return array;
          }
          output = {};
          for (key = i = 0, ref = array.length; i < ref; key = i += 1) {
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
          Schedules a given function which will not be called as long as it
          continues to be invoked. The function will be called after it stops
          being called for the given delay milliseconds. To be able to manage
          multiple, different debounce tasks an id string can be provided to
          identify the debounce task.
          @param {String} [id] - a string to identify the task.
                                Required to debounce different tasks at
                                the same time.
          @param {Number} delay - delay in milliseconds
          @param {Function} fn - function to be called
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
          device.__timerIds[id] = setTimeout(function() {
            if (device.__timerIds[id] === null) {
              members.debug("Timer id is null");
            }
            device.__timerIds[id] = null;
            return fn.call(device);
          }, delay);
          return Promise.resolve();
        },

        /*
          Generates a new device id which is not yet in use by another device
          @param {Object} framework - the pimatic framework object.
          @param {String} prefix - a prefix string to be used as part of
          the device id.
          @param {String} [lastId] - the lastId returned by generateDeviceId
          @returns {String} the id generated or undefined
          if id could not be generated
         */
        generateDeviceId: function(framework, prefix, lastId) {
          var cfg, i, m, matched, ref, result, start, x;
          if (lastId == null) {
            lastId = null;
          }
          start = 1;
          if (lastId != null) {
            m = lastId.match(/.*-([0-9]+)$/);
            if ((m != null) && m.length === 2) {
              start = +m[1] + 1;
            }
          }
          cfg = framework.deviceManager.devicesConfig;
          for (x = i = ref = start; i < 1000; x = i += 1) {
            result = prefix + "-" + x;
            matched = cfg.some(function(element, iterator) {
              return element.id === result;
            });
            if (!matched) {
              return result;
            }
          }
        }
      };
    }
  };
};

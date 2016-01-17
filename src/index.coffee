###
  @class pimatic-plugin-commons API
###
module.exports = (env) ->
  Promise = env.require 'bluebird'
  return {
    ###
      Waits for a given promise to be resolved or rejected.
    ###
    settled: (promise) -> Promise.settle([promise])

    ###
      Maps an array of promises or items to a mapping function resolving or
      rejection a promise. The mapping function will be called sequentially
      for each array item.
      @param {Array} input - an array of promises or items
      @param {Function} mapper - the mapping function
    ###
    series: (input, mapper) -> Promise.mapSeries(input, mapper)

    ###
      Base object providing device helper functions. **The functions described
      in the remainder of this document are members of base**.
      @param  {Object} device - the device object
      @param  {String} deviceName - the device name to be used for log output
    ###
    base: (device, deviceClassName) ->

      members = {
        _entityName: (id=device.id) ->
          "[#{deviceClassName}" + if id? then "##{id}]" else "]"

        ###
          Outputs an error message and optionally rejects a Promise on return.
          If the debug property is set on the device a stack trace is output.
          @param {Function} reject - function to reject a promise on return,
                                     may be null
          @param {Error} error  - error object
        ###
        rejectWithErrorString: (reject, error="Unknown") ->
          message = "" + (error.message ? error)
          if not message.match(/^Error:\ /)?
            message = "Error: " + message

          members.error message
          if device.debug is true
            members.stack error
          reject message if reject?

        ###
          Same as rejectWithErrorString, but has been deprecated
          @param {Function} reject - function to reject a promise on return, may be null
          @param {Error} error  - error object
          @deprecated
        ###
        rejectWithError: (reject, error="Unknown") ->
          members.rejectWithErrorString reject, error

        ###
          Outputs an debug message with an arbitrary list of arguments if
          the debug property is set. The output is prefixed with the
          'deviceClassName' and optionally the 'id' property (if present)
          of the device.
          @param ...
        ###
        debug: () ->
          if device.debug is true
            args = Array.prototype.slice.call arguments
            if args.length > 0
              args[0] = members._entityName() + ' ' + args[0]
            else
              args[0] = members._entityName()
            env.logger.debug args...

        ###
          Outputs an error message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param ...
        ###
        error: () ->
          if (device.debug is true or not device.__lastError? or
              device.__lastError isnt arguments[0] + "")
            device.__lastError = arguments[0] + ""
            args = Array.prototype.slice.call arguments
            if args.length > 0
              args[0] = members._entityName() + ' ' + args[0]
            else
              args[0] = members._entityName()
            env.logger.error args...

        ###
          Reset the lastError guard which inhibits the repeated
          output of the same error message
        ###
        resetLastError: () ->
          device.__lastError = ""

        ###
          Outputs a stack trace if debug is enabled.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param {Error}  [error] Error object, or null
        ###
        stack: (error=null) ->
          env.logger.error (
            if error?.stack? then error.stack else (new Error).stack)

        ###
          Set the named attribute to the given value. The attribute
          value must be kept in a member variable named `_<attributeName>`
          where `<attributeName>` is a place holder for the attribute name.
          @param {String} attributeName - the attribute name
          @param {Any} value - the attribute value
        ###
        setAttribute: (attributeName, value) ->
          if device['_' + attributeName] isnt value
            device['_' + attributeName] = value
            device.emit attributeName, value

        ###
          Cancel a scheduled update.
        ###
        cancelUpdate: () ->
          if device.__timeoutObject?
            clearTimeout device.__timeoutObject
            device.__timeoutObject = null

        ###
          Schedule an update. The given member function of the device
          is called after 'interval' milliseconds. Repeated call will
          remove any previous schedule.
          @param {Function} func - update function to be called
          @param {Number} interval - interval in milliseconds
        ###
        scheduleUpdate: (func, interval) ->
          members.cancelUpdate()

          if interval > 0
            members.debug "Next Request in #{interval} ms"
            device.__timeoutObject = setTimeout( ->
              device.__timeoutObject = null
              func.call(device)
            , interval
            )

        ###
          Normalize a given value to match the given lowerRange and
          upperRange. The latter is optional.
          @param {Number} value - the value
          @param {Number} lowerRange - the lower range
          @param {Number} [upperRange] - the upper range
        ###
        normalize: (value, lowerRange, upperRange) ->
          if upperRange?
            return Math.min (Math.max value, lowerRange), upperRange
          else
            return Math.max value, lowerRange

        ###
          Removes duplicates from a given array of strings or number items. The
          result is returned to a new array. The used algorithm has a linear
          complexity of O(2n) in the worst case.
          @param {Array} array - the input array
          @return {Array} the resulting array with unique items
        ###
        unique: (array) ->
          return array if array.length < 2
          output = {}
          output[array[key]] = array[key] for key in [0...array.length]
          value for key, value of output

        ###
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
        ###
        debounce: (id, delay, fn) ->
          if typeof(id) is 'number' and typeof(fn) is 'undefined'
            fn = delay
            delay = id
            id = 'default'
          device.__timerIds = {} unless device.__timerIds?
          if device.__timerIds[id]?
            clearTimeout device.__timerIds[id]
            device.__timerIds[id] = null

          device.__timerIds[id] = setTimeout () ->
            members.debug "Timer id is null" if device.__timerIds[id] is null
            device.__timerIds[id] = null
            fn.call device
          , delay
          Promise.resolve()
      }
  }
###
  @class pimatic-plugin-commons API
###
module.exports = (env) ->
  Promise = env.require 'bluebird'
  _intervalId = 0

  return common = {
    _periodicTimers: {}

    ###
      Waits for a given promise to be resolved or rejected.
      @param {Promise} promise - the promise to wait for
    ###
    settled: (promise) -> promise.reflect()

    ###
      Maps an array of promises or items to a mapping function resolving or
      rejection a promise. The mapping function will be called sequentially
      for each array item.
      @param {Array} input - an array of promises or items
      @param {Function} mapper - the mapping function
    ###
    series: (input, mapper) -> Promise.mapSeries(input, mapper)

    ###
      Calls a function repeatedly, with a fixed time delay between each call
      to that function. It is similar to setInterval(), but makes an immediate
      function call at the next ick rather than starting with timeout delay.
      Moreover, it adjust the delay time to dispatch periodic calls with higher
      accuracy than setInterval() does.
      @param {Function} func - the function to be called
      @param {Number} delay - delay in milliseconds
      @return {String} the timer id
    ###
    setPeriodicTimer: (func, delay) ->
      id = "setPeriodicTimer.#{++_intervalId}"
      timerData = {
        func: func
        delay: delay
        target: 0
        started: false
      }

      taskHandler = ((func, delay) ->
        unless timerData.started
          timerData.started = true
          common._periodicTimers[id] = setTimeout(taskHandler, timerData.target)
        else
          if timerData.target is 0
            adjust = 0
            timerData.target = timerData.delay
            timerData.startTime = Date.now() - timerData.delay
          else
            elapsed = Date.now() - timerData.startTime
            adjust = timerData.target - elapsed

          timerData.target += timerData.delay
          if common._periodicTimers.hasOwnProperty(id)
            common._periodicTimers[id] =
              setTimeout(taskHandler, timerData.delay + adjust)
            timerData.func()

        return id
      )
      return taskHandler(func, delay)

    ###
      Takes a given timer id returned by a setPeriodicTimer()
      call and clears the timer. Invalid timer ids are ignored.
      @param {String} id - the timer id
      @return {String} the timer id
    ###
    clearPeriodicTimer: (id) ->
      if common._periodicTimers.hasOwnProperty(id)
        clearTimeout common._periodicTimers[id]
        delete common._periodicTimers[id]

    ###
      Clears all active periodic timers.
    ###
    clearAllPeriodicTimers: () ->
      for own k, v of common._periodicTimers
        clearTimeout v
        delete common._periodicTimers[k]

    ###
      Returns the number of active period timers.
    ###
    activePeriodicTimers: () ->
      Object.keys(common._periodicTimers).length

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
          @param {String} [customMessage]  - a custom message to be used
                                             as prefix to the error message
        ###
        rejectWithErrorString: (reject, error="Unknown", customMessage=null) ->
          message = "" + (error.message ? error)
          if not message.match(/^Error:\ /)?
            message = "Error: " + message

          if customMessage?
            message = "#{customMessage}: #{message}"

          members.error message
          if device.debug is true
            members.stack error
          reject message if reject?

        ###
          Same as rejectWithErrorString, but has been deprecated
          @param {Function} reject - function to reject a promise on return,
                                     may be null
          @param {Error} error  - error object
          @deprecated
        ###
        rejectWithError: (reject, error="Unknown") ->
          members.rejectWithErrorString reject, error

        ###
          Outputs an info message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName' and optionally
          the 'id' property (if present) of the device.
          @param ...
        ###
        info: () ->
          args = Array.prototype.slice.call arguments
          if args.length > 0
            args[0] = members._entityName() + ' ' + args[0]
          else
            args[0] = members._entityName()
          env.logger.info args...

        ###
          Outputs a debug message with an arbitrary list of arguments if
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
          Note, a given undefined or null value is ignored.

          The optional `discrete` parameter can be used to optimize the update
          behaviour of discrete attribute value, i.e., the attribute value is
          only updated if the value has been changed.
          @param {String} attributeName - the attribute name
          @param {Any} value - the attribute value
          @param [Boolean} [discrete=false] - True if attribute value is
          discrete, e.g., a switch state. False, otherwise.
        ###
        setAttribute: (attributeName, value, discrete=false) ->
          if value? and not discrete or device['_' + attributeName] isnt value
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
          @param {Number} interval - interval in milliseconds. 0 will
                          trigger an immediate update
          @param [...] - additional parameters which are passed through
                         to the function specified by func once the
                         timer expires
        ###
        scheduleUpdate: (func, interval) ->
          members.cancelUpdate()

          if (typeof func is 'undefined')
            throw new Error "Missing function parameter"
          if (typeof interval is 'undefined' or interval < 0)
            throw new Error 'Missing or invalid interval parameter'
          else
            members.debug "Next Request in #{interval} ms"
            args = Array.prototype.splice.call arguments, 2
            device.__timeoutObject = setTimeout( ->
              device.__timeoutObject = null
              func.apply device, args
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
          output[array[key]] = array[key] for key in [0...array.length] by 1
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

        ###
          Generates a new device id which is not yet in use by another device
          @param {Object} framework - the pimatic framework object.
          @param {String} prefix - a prefix string to be used as part of
          the device id.
          @param {String} [lastId] - the lastId returned by generateDeviceId
          @returns {String} the id generated or undefined
          if id could not be generated
        ###
        generateDeviceId: (framework, prefix, lastId = null) ->
          start = 1
          if lastId?
            m = lastId.match /.*-([0-9]+)$/
            start = +m[1] + 1 if m? and m.length is 2

          cfg = framework.deviceManager.devicesConfig
          for x in [start...1000] by 1
            result = "#{prefix}-#{x}"
            matched = cfg.some (element, iterator) ->
              element.id is result
            return result if not matched
      }
  }
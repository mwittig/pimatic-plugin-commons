# Class UniPiUpdateManager
module.exports = (env) ->
  Promise = env.require 'bluebird'
  return {
    settled: (promise) -> Promise.settle([promise])
    series: (input, mapper) -> Promise.mapSeries(input, mapper)

    base: (device, deviceClassName) ->
      members = {
        _entityName: (id=device.id) ->
          "[#{deviceClassName}" + if id then "##{id}]" else "]"

        ###
          Outputs an error message and optionally rejects a Promise on return. If
            the debug property is set on the device a stack trace is output.
          @param {Function} reject - function to reject a promise on return, may be null
          @param {Error} error  - error object
        ###
        rejectWithError: (reject, error) ->
          message = "Error: " + error
          members.error message
          members.stack error
          reject message if reject?

        ###
          Outputs an debug message with an arbitrary list of arguments if
          the debug property is set. The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param ...
        ###
        debug: () ->
          if device.debug is true
            mainArguments = Array.prototype.slice.call arguments
            if mainArguments.length > 0
              mainArguments[0] = members._entityName() + ' ' + mainArguments[0]
            env.logger.debug mainArguments...

        ###
          Outputs an error message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param ...
        ###
        error: () ->
          if device.debug is true or not device.__lastError? or device.__lastError isnt arguments[0] + ""
            device.__lastError = arguments[0] + ""
            mainArguments = Array.prototype.slice.call arguments
            if mainArguments.length > 0
              mainArguments[0] = members._entityName() + ' ' + mainArguments[0]
            env.logger.error mainArguments...

        ###
          Reset the lastError guard which inhibits the repeated output of the same error message
        ###
        resetLastError: () ->
          device.__lastError = ""

        ###
          Outputs an error message with an arbitrary list of arguments.
          The output is prefixed with the 'deviceClassName'
          and optionally the 'id' property (if present) of the device.
          @param {Error}  [error] Error object, or null
        ###
        stack: (error=null) ->
          if device.debug is true
            env.logger.error if error?.stack? then error.stack else (new Error).stack

        ###
          Set the named attribute to the given value. The attribute
          value must be kept in a member variable named _<attributeName>
          where <attributeName> is a place holder for the attribute name.
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
            device.__timeoutObject = setTimeout( =>
              device.__timeoutObject = null
              func.call(device)
            , interval
            )

        normalize: (value, lowerRange, upperRange) ->
          if upperRange
            return Math.min (Math.max value, lowerRange), upperRange
          else
            return Math.max value, lowerRange

        unique: (array) ->
          return array if array.length < 2
          output = {}
          output[array[key]] = array[key] for key in [0...array.length]
          value for key, value of output
      }
  }
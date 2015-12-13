# Class UniPiUpdateManager
module.exports = (env) ->
  Promise = env.require 'bluebird'
  return {
    settled: (promise) -> Promise.settle([promise])
    series: (input, mapper) -> Promise.mapSeries(input, mapper)

    base: (device, deviceClassName) ->
      members = {

        rejectWithError: (reject, error) =>
          message = "#{deviceClassName} Error on device #{device.id}: " + error
          env.logger.error message, if device.debug then (new Error).stack else ""
          reject message if reject?

        debug: () ->
          if device.debug
            mainArguments = Array.prototype.slice.call arguments
            if mainArguments.length > 0
              mainArguments[0] = "[#{deviceClassName}] #{mainArguments[0]}"
            env.logger.debug mainArguments...

        error: () ->
          if device.debug or not device.__lastError? or device.__lastError isnt arguments[0] + ""
            device.__lastError = arguments[0] + ""
            mainArguments = Array.prototype.slice.call arguments
            if mainArguments.length > 0
              mainArguments[0] = "[#{deviceClassName}] #{mainArguments[0]}"
            env.logger.error mainArguments...
  
        setAttribute: (attributeName, value) ->
          if device['_' + attributeName] isnt value
            device['_' + attributeName] = value
            device.emit attributeName, value

        cancelUpdate: () ->
          if device.__timeoutObject?
            clearTimeout device.__timeoutObject

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
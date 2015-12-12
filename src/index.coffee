# Class UniPiUpdateManager
module.exports = (env) ->
  Promise = env.require 'bluebird'
  return {
    settled: (promise) -> Promise.settle([promise])
    series: (input, mapper) -> Promise.mapSeries(input, mapper)

    base: (device, deviceClassName) ->
      return members = {

        rejectWithError: (reject, error) =>
          message = "#{deviceClassName} Error on device #{device.id}: " + error
          env.logger.error message, if device.debug then (new Error).stack else ""
          reject message if reject?

        debug: () ->
          mainArguments = Array.prototype.slice.call arguments
          if mainArguments.length > 0
            mainArguments[0] = "[#{deviceClassName}] #{mainArguments[0]}"
          env.logger.debug mainArguments... if device.debug

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
            return Math.max value lowerRange
      }
  }
flatstack = require "flatstack"
type      = require "type-component"

module.exports = {
  options  : () -> true
  decorate : (target) ->

    target.callstack = flatstack()

    target.call = (startEvent, endEvent, next) ->

      # cover any case where next might not be a function. This might
      # happen when an async function does something like - model.load @view.render
      if type(next) isnt "function"
        next = () ->

      #startEvent = options.start
      #endEvent   = options.end
      startState = "states.#{startEvent}"
      endState   = "states.#{endEvent}"

      # throw the call into a queue
      @callstack.push () =>

        @set "error", undefined

        error = undefined
        
        @callstack.error (err) =>
          @set "error", error = err

        # emit the start event, and trigger any decorators
        @emit startEvent
        @set startState, true

        #called after all decorators are finished
        @callstack.push () =>

          # emit completion of given call
          @emit endEvent
          @set endState, true
          next error
}
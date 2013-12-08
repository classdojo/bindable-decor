var flatstack = require("flatstack"),
type          = require("type-component");

module.exports = {

  /**
   */

  options: function () {
    return true;
  },

  /**
   */

  decorate: function (target) {

    target.callstack = flatstack({ enforceAync: false });

    target.call = function (startEvent, endEvent, next) {

      if (type(next) !== "function") {
        next = function () { }
      }


      var startState = "states." + startEvent,
      endState       = "states." + endEvent,
      self           = this;

      this.callstack.push(function () {
        var error;

        self.callstack.error(function (err) {
          error = err;
        });

        self.emit(startEvent);
        self.set(startState, true);

        self.callstack.push(function () {
          self.emit(endEvent);
          self.set(endState, true);
          next(error);
        })
      })
    };
  }
}
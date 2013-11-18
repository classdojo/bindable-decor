var type   = require("type-component"),
decorable  = require("./decor/decorable"),
protoclass = require("protoclass");


function BindableDecor () {

    this._available  = [];
    this._priorities = {};
    this._id         = 0;

    this.use(decorable);
}


protoclass(BindableDecor, {

  /**
   */

  priority: function (name, level) {
    this._priorities[name] = level;
    return this;
  },

  /**
   */

  use: function () {
    var i, options, decorators = Array.prototype.slice.call(arguments, 0);


    // go through all the decorators, and register then
    for (i = decorators.length; i--;) {
      
      options = decorators[i];

      if (type(options) === "function" || options.options || options.getOptions)  {
        options = {
          factory: options,
          priority: options.priority,
          inheritable: options.inheritable,
          name: options.name
        };
      };

      decorator = options.clazz || options["class"] || options.factory || options.decorator || options;

      if (!decorator.options) {
        decorator.options = decorator.getOptions;
      }

      this._available.push({

        // name of the decorator
        name        : options.name || this._id++,

        // the decorator obj
        decorator   : decorator,

        // decorators are inherited from the parent class, but some decorators
        // are not ineritable, such as templates
        inheritable : !!options.inheritable,

        // set the priority of the decorator - this is 
        priority    : this._priorities[options.priority] || this._available.length
      });
    }
  },

  /**
   */

  decorate: function (target, decor) {

    var decorators, decor

    if (decor) {
      decorators = this._findDecorators(decor);
    } else {

      // cached?
      decorators = target.__decorators;
    }


    if (decorators) {
      this._setDecorators(target, decorators);
    } else {
      decor = this._findDecorators(target);

      // cache it.
      target.constructor.prototype.__decorators = target.__decorators = decor;
      this.decorate(target);
    }
  },

  /**
   * Finds ALL the decorators for a bindable object, including the parent 
   * decorators which should be inherited (but overridden by the child prototype)
   */

  _findDecorators: function (target) {
    var used, pt, ct = target, decorators = [];

    while (ct) {
      // attach from the class, along with the prototype. class = optimal
      decorators = decorators.concat(this._findDecorators2(ct, pt)).concat(this._findDecorators2(ct.constructor, pt ? pt.constructor : undefined))

      pt = ct
      ct = ct.__super__;
    }

    used = {};

    decorators.sort(function (a, b) {
      return a.priority > b.priority ? 1 : -1;
    }).filter(function (a) {

      if (!used[a.name]) {
        used[a.name] = true;
        return true;
      }

      return used[a.name] && a.ineritable;
    });


    return decorators;
  },

  /**
   */

  _findDecorators2: function (proto, child) {
    var i, d, decorator, decorators = [];

    for(i = this._available.length; i--;) {

      d = this._available[i];
      decorator = d.decorator;

      if (options = decorator.options(proto)) {

        if (child && options == decorator.options(child)) {
          continue;
        }

        decorators.push({
          decorator   : decorator,
          name        : decorator.name || this._id++,
          inheritable : decorator.inheritable,
          options     : options,
          priority    : d.priority
        });
      }
    }

    return decorators;
  },

  /**
   */

  _setDecorators: function (target, decorators) {
    var i, decor;

    for(i = decorators.length; i--;) {
      decor = decorators[i];

      decor.decorator.decorate(target, decor.options);
    }
  }

});

module.exports = function () {
  return new BindableDecor();
}
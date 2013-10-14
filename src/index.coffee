type = require("type-component")
Decorable = require "./decorable"

class BindableDecor

  ###
  ###

  constructor: () ->
    @_available = []
    @_id = 0

  ###
  ###

  use: (decorators...) =>
    for options in decorators
      if (type(options) is "function") or options.options or options.getOptions
        options = {
          factory: options
        }


      decorator = options.clazz or options.factory or options.decorator

      # getOptions = deprecated
      unless decorator.options
        decorator.options = decorator.getOptions

      @_available.push {
        name        : options.name or @_id++,
        decorator   : decorator,
        inheritable : !!options.inheritable
      }

  ###
  ###

  decorate: (target, decor) ->

    if decor 
      decorators = @_findDecorators decor
    else
      decorators = target.__decorators


    if decorators
      @_setDecorators target, decorators
    else
      decor = @_findDecorators target
      target.constructor.prototype.__decorators = target.__decorators = decor
      @decorate target

  ###
   Finds ALL the decorators for a bindable object, including the parent 
   decorators which should be inherited (but overridden by the child prototype)
  ###

  _findDecorators: (target) ->
    decorators = []

    ct = target
    pt = undefined

    while ct

      # attach from the class, along with the prototype. class = optimal
      decorators = decorators.concat @_findDecorators2(ct, pt).concat @_findDecorators2 ct.constructor, pt?.constructor

      pt = ct
      ct = ct.__super__

    used = {}

    decorators.sort((a, b) ->
      if a.priority > b.priority then 1 else -1
    ).filter (a) ->
      unless used[a.name]
        used[a.name] = true
        return true

      used[a.name] and a.inheritable

    decorators

  ###
  ###

  _findDecorators2: (proto, child) ->
    decorators = []
    for d, priority in @_available
      decorator = d.decorator
      if options = decorator.options proto

        continue if child and options is decorator.options(child)
        decorators.push {
          decorator   : decorator,
          name        : decorator.name,
          inheritable : decorator.inheritable,
          options     : options,
          priority    : priority
        }
    decorators

  ###
  ###

  _setDecorators: (target, decorators) -> 
    for decor in decorators
      d = decor.decorator.decorate target, decor.options
    undefined




module.exports = () -> new BindableDecor()
module.exports.Decorable = Decorable
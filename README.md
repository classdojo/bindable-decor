

```coffeescript
decor     = require("bindable-decor")
bindable  = require("bindable")
factory   = decor.factory()

factory.use(decor.bindable)
factory.use(decor.preload)
factory.use(decor.virtuals)



class Person extends decor.Decorable

  ###
   bindings to properties on this model
  ###
  
  bindings:
    "firstName, lastName": 
      "fullName":
        "map": 
          "to": (firstName, lastName) ->
            [firstName, lastName].join(" ")
            
  ###
   validates the properties on this model
  ###
  
  fields:
    firstName: "string"
    lastName: "string"
    fullName: "string"
  
  ###
   virtual properties only get called when bound to
  ###
  
  virtuals:
    classes: (next) ->
      loadClasses @, next
    
  ###
  ###
  
  constructor: () ->
    super()
    
    
person = new Person({ firstName: "craig", lastName: "condon" })

console.log(person.get("fullName")) #craig condon

# nothing
person.get("classes");

# trigger virtual
person.bind("classes").to (value) ->
  console.log classes
  
```

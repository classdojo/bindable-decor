```coffeescript
decor     = require("bindable-decor")
bindable  = require("bindable")
factory   = decor.factory()

factory.use(decor.bindable);
factory.use(decor.preload);
factory.use(decor.virtuals);



class Person extends bindable.Object

  ###
  ###
  
  bindings:
    "firstName, lastName": 
      "fullName":
        "map": 
          "to": (firstName, lastName) ->
            [firstName, lastName].join(" ")
            
  ###
  ###
  
  fields:
    firstName: "string"
    lastName: "string"
    fullName: "string"
    
  
  ###
  ###
  
  virtuals:
    classes: (next) ->
      loadClasses @, next
    
    
    
  ###
  ###
  
  constructor: () ->
    super()
    factory.decorate @
    
    
person = new Person({ firstName: "craig", lastName: "condon" });

console.log(person.get("fullName"));
```

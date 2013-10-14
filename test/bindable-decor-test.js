var expect = require("expect.js"),
bindable = require("bindable"),
bindableDecor = require("..");


describe("decor#", function() {

  var decor = bindableDecor();

  it("can register a decorator", function() {
    decor.use({
      options: function() {
        return true;
      },
      decorate: function(model) {
        model.test = true;
      }
    })
  });


  it("can decorate a model", function() {
    var person = new bindable.Object();
    decor.decorate(person);
    expect(person.test).to.be(true);
  });

});
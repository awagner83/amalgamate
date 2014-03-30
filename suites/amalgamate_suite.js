(function(exports){

var benches = {

  string: {
    source:  "Hello World!",
    context: {}
  },

  replace: {
    source:  "Hello {{name}}! You have {{count}} new messages.",
    context: { name: "Mick", count: 30 }
  },

  array: {
    source:  "{{#names}}{{name}}{{/names}}",
    context: { names: [
                 { name: "Moe" },
                 { name: "Larry" },
                 { name: "Curly" },
                 { name: "Shemp" }
               ]
             }
  },

  object: {
    source:  "{{#person}}{{name}}{{age}}{{/person}}",
    context: { person: { name: "Larry", age: 45 } }
  },

  filter: {
      source: "FOO {{bar|filter}}",
      context: {
          filter: function(text) { return text.toUpperCase(); },
          bar: 'bar'
      }
  },

  complex: {
    source:  "<h1>{{null|header}}</h1>\n"                          +
             "{{?items}}\n"                                        +
             "  <ul>\n"                                            +
             "    {{#items}}\n"                                    +
             "      {{?current}}\n"                                +
             "        <li><strong>{{name}}</strong></li>\n"        +
             "      {{:else}}\n"                                   +
             "        <li><a href=\"{{url}}\">{{name}}</a></li>\n" +
             "      {{/current}}\n"                                +
             "    {{/items}}\n"                                    +
             "  </ul>\n"                                           +
             "{{:else}}\n"                                         +
             "  <p>The list is empty.</p>\n"                       +
             "{{/items}}",
    context: {
               header: function() {
                 return "Colors";
               },
               items: [
                 {name: "red", current: true, url: "#Red"},
                 {name: "green", current: false, url: "#Green"},
                 {name: "blue", current: false, url: "#Blue"}
               ]
             }
  }

};

exports.amalgamateBench = function(suite, name, id) {
    var bench = benches[name],
        ctx = bench.context;

    tpl = Amalgamate.load(Amalgamate.compile(bench.source));
    suite.bench(id || name, function(next) {
        Amalgamate.render(tpl, ctx);
        next();
    });
};

exports.amalgamateBench.benches = benches

})(typeof exports !== 'undefined' ? exports: window);

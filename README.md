## amalgamate - a template library for javascript

Run benchmarks: `coffee bench.coffee`

Run tests: `grunt nodeunit`

### Currently supported features:

#### Replace

    {{myContextVar}}
  
#### Deep Replace

    {{path.to.my.var}}
  
#### Object Scoping

    {{@myObject}}
      {{someProperty}}
    {{/myObject}}
  
#### Array Iteration

    {{#myArray}}
      {{somePropertyOnCurrentArrayObject}}
    {{/myArray}}
  
#### Existence Checking

    {{?doesItExist}}
      Yes it does!
    {{/doesItExist}}
  
#### Inverse Existence Checking

    {{^doesItExist}}
      Nope, it does.
    {{/doesItExist}}
  
------

### What's left to be done:

- Lots of features need added (partials, helpers, inheritance, etc).
- Browser based template examples/try-it-out tool.
- Browser benchmark support.
- Fixes to highly flawed benchmarks.
- Runtime tests
- Split runtime from compiler (smaller runtime js)
- Build tools to support creation of various build (full, full-min, runtime-only, runtime-only-min)
- Safe variable replacements (strip html from values)

## amalgamate - a template library for javascript

**tldr;** *An experimental (and hopefully fast) template library for javascript
that supports context-var replacements, deep-replace, object-scoping,
array-iteration, and existence-checking (both positive and negative)... all in 
about 578 B (minified and gzipped)*

Run the benchmarks: `coffee bench.coffee`

Run the tests: `grunt nodeunit`

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

- Lots of features need added (partials, helpers, inheritance, filters, etc.).
- Browser based template examples/try-it-out tool.
- Browser benchmark support.
- Runtime tests
- Split runtime from compiler (smaller runtime JavaScript)
- Build tools to support creation of various build (full, full-min, runtime-only, runtime-only-min)

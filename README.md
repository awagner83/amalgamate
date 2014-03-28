## amalgamate - a template library for javascript

**tldr;** *An experimental (and hopefully fast) template library for javascript
that supports context-var replacements, deep-replace, object-scoping,
array-iteration, filters, and existence-checking (both positive and
negative)... all in about 415 B (runtime only, minified and gzipped)*

---

Try it out: http://awagner83.github.io/amalgamate/

Run the benchmarks: `coffee bench.coffee`

Run the tests: `grunt nodeunit`

### Features:

#### Replace

    {{myContextVar}}
  
#### Deep Replace

    {{path.to.my.var}}
  
#### Object Scoping

    {{@myObject}}
      {{someProperty}}
    {{/myObject}}

Or simply:

    {{@myObject}}
      {{someProperty}}
    {{/}}

This works for all block-style instructions
  
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

#### Filters

Filters functions can be supplied in the context.

Template:

    {{name|shout}}

Context:

```javascript
{
    name: "bob",
    shout: function (str) {
        return str.toUpperCase() + "!";
    }
}
```

Output:

    BOB!

Filters can also be applied to values used for object scoping:

    {{@fullName|splitName}}
        {{last}}, {{first}}
    {{/fullName}}

Context:

```javascript
{
    fullName: "Bob Smith",
    splitName: function (name) {
        var parts = name.split(' ');
        return {first: parts[0], last: parts[1]};
    }
}
```

Output:

    Smith, Bob


#### Portable Compiled Templates

Compiled templates are valid JSON data and can be loaded and used anywhere
the runtime is included (without `eval`ing javascript).
  
------

### What's left to be done:

- Lots of features need added (partials, helpers, inheritance, etc.).
- Browser based template examples/try-it-out tool.
- Browser benchmark support.
- Split runtime from compiler (smaller runtime JavaScript)
- Build tools to support creation of various build (full, full-min, runtime-only, runtime-only-min)

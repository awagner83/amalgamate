
Benchmark = require 'benchmark'
_ = require 'underscore'

amalgamate = require './index'
Handlebars = require 'handlebars'
dust = require 'dustjs-linkedin'
mustache = require 'mustache'


mkTests = ->
    string:
        context: {}
        expected: 'hello world'
        implementations: [
            mkAmalgamate 'hello world'
            mkDust 'hello world'
            mkHandlebars 'hello world'
            mkMustache 'hello world'
            mkUnderscore 'hello world'
        ]
    replace:
        context: {me: 'Adam', you: 'Bob'}
        expected: "hello Bob, I'm Adam"
        implementations: [
            mkAmalgamate "hello {{you}}, I'm {{me}}"
            mkDust "hello {you}, I'm {me}"
            mkHandlebars "hello {{you}}, I'm {{me}}"
            mkMustache "hello {{you}}, I'm {{me}}"
            mkUnderscore "hello <%=you %>, I'm <%=me %>"
        ]
    bigReplace:
        context:
            a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10, k: 11, l: 12, m: 13, n: 14, o: 15, p: 16, q: 17, r: 18, s: 19, t: 20
        expected: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20"
        implementations: [
            mkAmalgamate "{{a}} {{b}} {{c}} {{d}} {{e}} {{f}} {{g}} {{h}} {{i}} {{j}} {{k}} {{l}} {{m}} {{n}} {{o}} {{p}} {{q}} {{r}} {{s}} {{t}}"
            mkDust "{a} {b} {c} {d} {e} {f} {g} {h} {i} {j} {k} {l} {m} {n} {o} {p} {q} {r} {s} {t}"
            mkHandlebars "{{a}} {{b}} {{c}} {{d}} {{e}} {{f}} {{g}} {{h}} {{i}} {{j}} {{k}} {{l}} {{m}} {{n}} {{o}} {{p}} {{q}} {{r}} {{s}} {{t}}"
            mkMustache "{{a}} {{b}} {{c}} {{d}} {{e}} {{f}} {{g}} {{h}} {{i}} {{j}} {{k}} {{l}} {{m}} {{n}} {{o}} {{p}} {{q}} {{r}} {{s}} {{t}}"
            mkUnderscore "<%=a %> <%=b %> <%=c %> <%=d %> <%=e %> <%=f %> <%=g %> <%=h %> <%=i %> <%=j %> <%=k %> <%=l %> <%=m %> <%=n %> <%=o %> <%=p %> <%=q %> <%=r %> <%=s %> <%=t %>"
        ]
    dottedReplace:
        context:
            name:
                first: 'Bob'
                last: 'Smith'
        expected: "Smith, Bob"
        implementations: [
            mkAmalgamate "{{name.last}}, {{name.first}}"
            mkDust "{name.last}, {name.first}"
            mkHandlebars "{{name.last}}, {{name.first}}"
            mkMustache "{{name.last}}, {{name.first}}"
            mkUnderscore "<%=name.last %>, <%=name.first %>"
        ]
    filterReplace:
        context:
            name: 'bob'
            shout: (str) -> str.toUpperCase() + "!"
        expected: "BOB!"
        implementations: [
            mkAmalgamate "{{name|shout}}"
        ]
    ifSo:
        context: {isTrue: true}
        expected: "Yes, it's true"
        implementations: [
            mkAmalgamate "{{?isTrue}}Yes, it's true{{/isTrue}}{{?isFalse}}No, it's false{{/isFalse}}"
            mkDust "{?isTrue}Yes, it's true{/isTrue}{?isFalse}No, it's false{/isFalse}"
            mkHandlebars "{{#isTrue}}Yes, it's true{{/isTrue}}{{#isFalse}}No, it's false{{/isFalse}}"
            mkMustache "{{#isTrue}}Yes, it's true{{/isTrue}}{{#isFalse}}No, it's false{{/isFalse}}"
            mkUnderscore "<% if(isTrue) { %>Yes, it's true<% } %><% if(typeof isFalse !== 'undefined') { %>No, it's false<% } %>"
        ]
    ifNot:
        context: {isTrue: false}
        expected: "No, it's false.  Also false."
        implementations: [
            mkAmalgamate "{{^isTrue}}No, it's false.{{/isTrue}}  {{^foo}}Also false.{{/foo}}"
            mkDust "{^isTrue}No, it's false.{/isTrue}  {^foo}Also false.{/foo}"
            mkHandlebars "{{^isTrue}}No, it's false.{{/isTrue}}  {{^foo}}Also false.{{/foo}}"
            mkMustache "{{^isTrue}}No, it's false.{{/isTrue}}  {{^foo}}Also false.{{/foo}}"
            mkUnderscore "<% if(!isTrue) { %>No, it's false.<% } %><% if(typeof foo === 'undefined') { %>  Also false.<% } %>"
        ]
    emptyArray:
        context: {people: []}
        expected: "people:"
        implementations: [
            mkAmalgamate "people:{{#people}}{{name}}, {{/people}}"
            mkDust "people:{#people}{name}, {/people}"
            mkHandlebars "people:{{#people}}{{name}}, {{/people}}"
            mkMustache "people:{{#people}}{{name}}, {{/people}}"
            mkUnderscore "people:<% for(var i = 0, len = people.length; i < len; i++) { %><%=people[i].name %>, <% } %>"
        ]
    array:
        context: {people: [{name: 'bob'}, {name: 'fred'}, {name: 'jim'}]}
        expected: "bob, fred, jim, and others"
        implementations: [
            mkAmalgamate "{{#people}}{{name}}, {{/people}}and others"
            mkDust "{#people}{name}, {/people}and others"
            mkHandlebars "{{#people}}{{name}}, {{/people}}and others"
            mkMustache "{{#people}}{{name}}, {{/people}}and others"
            mkUnderscore "<% for(var i = 0, len = people.length; i < len; i++) { %><%=people[i].name %>, <% } %>and others"
        ]
    nestedArray:
        context:
            primes: [
                {
                    prime: 2
                    composites: [{composite: 4}, {composite: 6}, {composite: 8}]
                }
                {
                    prime: 3
                    composites: [{composite: 6}, {composite: 9}, {composite: 12}]
                }
                {
                    prime: 5
                    composites: [{composite: 10}, {composite: 15}, {composite: 20}]
                }
            ]
        expected: "2 (4, 6, 8, ...); 3 (6, 9, 12, ...); 5 (10, 15, 20, ...); "
        implementations: [
            mkAmalgamate "{{#primes}}{{prime}} ({{#composites}}{{composite}}, {{/composites}}...); {{/primes}}"
            mkDust "{#primes}{prime} ({#composites}{composite}, {/composites}...); {/primes}"
            mkHandlebars "{{#primes}}{{prime}} ({{#composites}}{{composite}}, {{/composites}}...); {{/primes}}"
            mkMustache "{{#primes}}{{prime}} ({{#composites}}{{composite}}, {{/composites}}...); {{/primes}}"
            mkUnderscore "<% for(var i = 0, len = primes.length; i < len; i++) { %><%=primes[i].prime %> (<% for(var j = 0, jlen = primes[i].composites.length; j < jlen; j++) {%><%=primes[i].composites[j].composite %>, <% } %>...); <% } %>"
        ]
    object:
        context:
            name:
                first: 'Bob'
                last: 'Smith'
        expected: "Smith, Bob"
        implementations: [
            mkAmalgamate "{{@name}}{{last}}, {{first}}{{/name}}"
            mkDust "{#name}{last}, {first}{/name}"
            mkHandlebars "{{#name}}{{last}}, {{first}}{{/name}}"
            mkMustache "{{#name}}{{last}}, {{first}}{{/name}}"
            mkUnderscore "<% var first = name.first, last = name.last %><%=last %>, <%=first%>"
        ]
    objectPostFilter:
        context:
            shout: (str) ->
                str.toUpperCase() + '!'
            name:
                first: 'Bob'
                last: 'Smith'
        expected: "SMITH, BOB!"
        implementations: [
            mkAmalgamate "{{@name}}{{last}}, {{first}}{{/name|shout}}"
        ]
    nestedObject:
        context:
            name:
                name:
                    first: 'bob'
        expected: "bob"
        implementations: [
            mkAmalgamate "{{@name}}{{@name}}{{first}}{{/name}}{{/name}}"
            mkDust "{#name}{#name}{first}{/name}{/name}"
            mkHandlebars "{{#name}}{{#name}}{{first}}{{/name}}{{/name}}"
            mkMustache "{{#name}}{{#name}}{{first}}{{/name}}{{/name}}"
            mkUnderscore "<% var first = name.name.first, last = name.name.last %><%=first%>"
        ]



mkAmalgamate = (template) ->
    name: 'amalgamate'
    compile: -> amalgamate.load (amalgamate.compile template)
    run: (compiled, context) -> amalgamate.render compiled, context

mkHandlebars = (template) ->
    name: 'handlebars'
    compile: -> Handlebars.compile template
    run: (compiled, context) -> compiled context

mkMustache = (template) ->
    name: 'mustache'
    compile: -> template
    run: (compiled, context) -> mustache.render compiled, context

mkUnderscore = (template) ->
    name: 'underscore'
    compile: -> _.template template
    run: (compiled, context) -> compiled context

mkDust = (template) ->
    templateName = _.uniqueId 'dust'
    name: 'dust'
    defer: true
    compile: ->
        compiled = dust.compile(template, templateName)
        dust.loadSource compiled
    run: (compiled, context, success) ->
        dust.render templateName, context, (err, result) -> success result


suite = new Benchmark.Suite

allTests = mkTests()
requestedTests = process.argv.slice 2
tests = if requestedTests.length then _.pick allTests, requestedTests else allTests

_.each tests, (test, name) ->
    return if test.disabled
    _.each test.implementations, (impl) ->
        compiled = impl.compile()
        testRunName = "#{name} - #{impl.name}"

        if impl.defer
            impl.run compiled, test.context, (actual) ->
                if actual != test.expected
                    console.warn "#{testRunName} failed!\n  #{actual}\n  #{test.expected}"
            suite.add testRunName,
                defer: true
                fn: (deferred) ->
                    impl.run compiled, test.context, -> deferred.resolve()
        else
            actual = impl.run compiled, test.context
            if actual != test.expected
                console.warn "#{testRunName} failed!\n  #{actual}\n  #{test.expected}"
            suite.add testRunName, -> impl.run compiled, test.context

console.log "\nRunning benchmarks..."
suite.on 'cycle', (e) -> console.log String(e.target)
suite.run async: true

        

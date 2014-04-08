
amalgamate = require '../src/runtime.js'
compiler = require '../src/compiler.js'

# Short aliases to builders
replace = compiler.builders.replace
array   = compiler.builders.array
object  = compiler.builders.object
ifSo    = compiler.builders.ifSo
ifNot   = compiler.builders.ifNot

cases = [
    {
        name: 'static text'
        template: ['test']
        context: {}
        expected: 'test'
    }
    {
        name: 'replace'
        template: [replace 'test']
        context: {test: 'foo'}
        expected: 'foo'
    }
    {
        name: 'escaping replace'
        template: [replace 'test']
        context: {test: '<b>test'}
        expected: '&lt;b&gt;test'
    }
    {
        name: 'replace "dot"'
        template: [replace '.']
        context: 'foo'
        expected: 'foo'
    }
    {
        name: 'static text and replace'
        template: ['hello ', replace 'you']
        context: {you: 'bob'}
        expected: 'hello bob'
    }
    {
        name: 'array with static text'
        template: [
            array 'things', ['.']
        ]
        context: {things: [1,2,3]}
        expected: '...'
    }
    {
        name: 'array with replace'
        template: [
            array 'things', [replace 'value']
        ]
        context: {
            things: [
                {value: 1}
                {value: 2}
            ]
        }
        expected: '12'
    }
    {
        name: 'existence check with static text'
        template: [
            ifSo 'thing', ['thing exists!']
        ]
        context: {thing: 'some value'}
        expected: 'thing exists!'
    }
    {
        name: 'existence check with static text (no value found)'
        template: [
            ifSo 'thing', ['thing exists!']
        ]
        context: {someOtherThing: 'some value'}
        expected: ''
    }
    {
        name: 'existence check with static text (no value found, but with else)'
        template: [
            ifSo 'thing', ['thing exists!'], ['thing does not exist']
        ]
        context: {someOtherThing: 'some value'}
        expected: 'thing does not exist'
    }
    {
        name: 'inverse existence check with static text'
        template: [
            ifNot 'thing', ['thing does not exist']
        ]
        context: {someOtherThing: 'some value'}
        expected: 'thing does not exist'
    }
    {
        name: 'inverse existence check with static text (value found)'
        template: [
            ifNot 'thing', ['thing does not exist']
        ]
        context: {thing: 'some value'}
        expected: ''
    }
    {
        name: 'inverse existence check with static text (value found, but with else)'
        template: [
            ifNot 'thing', ['thing does not exist'], ['thing does exist']
        ]
        context: {thing: 'some value'}
        expected: 'thing does exist'
    }
    {
        name: 'object scoping'
        template: [
            object 'thing', [replace 'value']
        ]
        context: {thing: {value: 5}}
        expected: '5'
    }
    {
        name: 'deep replace'
        template: [
            replace 'thing.value'
        ]
        context: {thing: {value: 5}}
        expected: '5'
    }
    {
        name: 'replace with filter'
        template: [
            replace 'name|shout'
        ]
        context:
            name: 'bob'
            shout: (text) -> text.toUpperCase() + '!'
        expected: 'BOB!'
    }
    {
        name: 'object with filter'
        template: [
            object 'name|fullName', [
                replace 'last'
                ', '
                replace 'first'
            ]
        ]
        context:
            name: 'bob smith'
            fullName: (name) ->
                [first, last] = name.split ' '
                first: first, last: last
        expected: 'smith, bob'
    }
]

# Export list of tests
module.exports = {}
cases.forEach (testCase) ->
    module.exports[testCase.name] = (test) ->
        actual = amalgamate.render (amalgamate.load testCase.template), testCase.context
        test.deepEqual actual, testCase.expected
        test.expect 1
        test.done()


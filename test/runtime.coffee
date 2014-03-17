
amalgamate = require '../amalgamate.js'

# Short aliases to builders
replace = amalgamate._builders.replace
array   = amalgamate._builders.array
object  = amalgamate._builders.object
ifSo    = amalgamate._builders.ifSo
ifNot   = amalgamate._builders.ifNot

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
]

# Export list of tests
module.exports = {}
cases.forEach (testCase) ->
    module.exports[testCase.name] = (test) ->
        actual = amalgamate.render testCase.template, testCase.context
        test.deepEqual actual, testCase.expected
        test.expect 1
        test.done()


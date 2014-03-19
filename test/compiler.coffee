
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
        input: 'test'
        expected: ['test']
    }
    {
        name: 'context replacement'
        input: '{{test}}'
        expected: [replace('test')]
    }
    {
        name: 'static text and replacements'
        input: 'hello {{you}}.'
        expected: [
            'hello '
            replace 'you'
            '.'
        ]
    }
    {
        name: 'array with static text'
        input: '{{#thing}}found a thing{{/thing}}'
        expected: [
            array 'thing', ['found a thing']
        ]
    }
    {
        name: 'array with replacement'
        input: '{{#things}}{{thing}}{{/things}}'
        expected: [
            array 'things', [replace 'thing']
        ]
    }
    {
        name: 'existence check with static text'
        input: '{{?thing}}thing exists!{{/thing}}'
        expected: [
            ifSo 'thing', ['thing exists!']
        ]
    }
    {
        name: 'existence check with embedded array'
        input: '{{?things}}{{#things}}this is one thing{{/things}}{{/things}}'
        expected: [
            ifSo 'things', [
                array 'things', ['this is one thing']
            ]
        ]
    }
    {
        name: 'inverse existence check with static test'
        input: '{{^thing}}thing does not exist!{{/thing}}'
        expected: [
            ifNot 'thing', ['thing does not exist!']
        ]
    }
    {
        name: 'object with static text'
        input: '{{@thing}}inside my thing{{/thing}}'
        expected: [
            object 'thing', ['inside my thing']
        ]
    }
    {
        name: 'complex (rendering a table of data)'
        input: '''
        Table of things

        {{?things}}
        <table>
            <thead>
                <tr>
                    <th>Column 1</th>
                    <th>Column 2</th>
                </tr>
            </thead>
            <tbody>
                {{#things}}
                <tr>
                    <td>{{col1}}</td>
                    <td>{{col2}}</td>
                </tr>
                {{/things}}
            </tbody>
        </table>
        {{/things}}

        {{^things}}
        No things were found!
        {{/things}}
        '''
        expected: [
            'Table of things\n\n'
            ifSo 'things', [
                '\n<table>\n    <thead>\n        <tr>\n            <th>Column 1</th>\n            <th>Column 2</th>\n        </tr>\n    </thead>\n    <tbody>\n        '
                array 'things', [
                    '\n        <tr>\n            <td>'
                    replace 'col1'
                    '</td>\n            <td>'
                    replace 'col2'
                    '</td>\n        </tr>\n        '
                ]
                '\n    </tbody>\n</table>\n'
            ]
            '\n\n'
            ifNot 'things', ['\nNo things were found!\n']
        ]
    }
]

# Export list of tests.
module.exports = {}
cases.forEach (testCase) ->
    module.exports[testCase.name] = (test) ->
        test.deepEqual (compiler.compile testCase.input), testCase.expected
        test.expect 1
        test.done()


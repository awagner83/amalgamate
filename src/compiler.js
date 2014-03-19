
var runtime = require('./runtime.js');
var operations = runtime._operations;

/** Build individual operations to pass to 'render_internal' **/
var builders = {
    replace: function(name) {
        var parts = name.split('|'),
            namePart = parts[0],
            filters = parts.slice(1),
            splitName = namePart.split('.');

        if (filters.length > 0)
            return {
                op: operations.filteredReplace,
                data: { name: splitName, filters: filters }
            };
        else if (splitName.length === 1)
            return { op: operations.replace, data: name };
        else
            return { op: operations.deepReplace, data: splitName };
    },
    array: function(array, template) {
        return { op: operations.array, data: { array: array, template: template } };
    },
    object: function(object, template) {
        return { op: operations.object, data: { object: object, template: template } };
    },
    ifSo: function(name, template) {
        return { op: operations.ifSo, data: { name: name, template: template } };
    },
    ifNot: function(name, template) {
        return { op: operations.ifNot, data: { name: name, template: template } };
    }
};

/** Generate compiled template from template string **/
var compile = function() {
    var composeParts = function (parts, collected) {
        var result = [];
        for (var i = 0, len = parts.length; i < len; i++) {
            var part = parts[i];
            if (typeof part === 'string') {
                result.push(part);
            } else {
                result.push(collected[part]);
            }
        }
        return result.join('');
    };
    var until = function() {
        var stopAtParts = Array.prototype.slice.call(arguments, 0);
        return function(string, collected) {
            var stopAt = composeParts(stopAtParts, collected),
                sliceTo = string.indexOf(stopAt);
            if (sliceTo === -1) {
                return [string, ''];
            }
            return [string.slice(0, sliceTo), string.slice(sliceTo)];
        };
    };
    var skip = function() {
        var skipParts = Array.prototype.slice.call(arguments, 0);
        return function(string, collected) {
            var skip = composeParts(skipParts, collected);
            if (string.indexOf(skip) === 0) {
                return ['', string.slice(skip.length)];
            }
            return false;
        };
    };
    var not = function(cannotBe) {
        return function(string, collected) {
            if (cannotBe.indexOf(string.slice(0, 1)) === -1) {
                return [string.slice(0, 1), string.slice(1)];
            }
            return false;
        };
    };
    var recurse = function(string, collected) {
        var result = compile(string, true);
        if (result.partial) {
            return [result.instructions, result.leftovers];
        } else {
            return [result, ''];
        }
    };
    var blockInstruction = function(prefix, builder) {
        return {
            rule: [
                skip('{{' + prefix),
                until('}}'),
                skip('}}'),
                recurse,
                skip('{{/', 1, '}}')
            ],
            parse: function (parts) {
                // Filter 'falsey' values from subtemplate
                var subTemplate = [];
                for (var i = 0, n = parts[3].length; i < n; i++) {
                    if (parts[3][i]) subTemplate.push(parts[3][i]);
                }
                return builder(parts[1], subTemplate);
            }
        };
    };
    var instructionTypes = [
        blockInstruction('#', builders.array),
        blockInstruction('@', builders.object),
        blockInstruction('?', builders.ifSo),
        blockInstruction('^', builders.ifNot),

        // Replacements
        {
            rule: [skip('{{'), not('#@?^/'), until('}}'), skip('}}')],
            parse: function (parts) {
                return builders.replace(parts[1] + parts[2]);
            }
        },

        // Ordinary text
        {
            rule: [until('{{')],
            parse: function (parts) {
                return parts[0];
            }
        },
    ];
    return function(templateString, keepLeftovers) {
        var instructions = [],
            nInstructionTypes = instructionTypes.length,
            lengthBefore = null;
        while (templateString.length &&
                // Ensure we never loop forever
                templateString.length != lengthBefore) {
            lengthBefore = templateString.length;
            instructionsTypesLoop:
            for (var i = 0; i < nInstructionTypes; i++) {
                var token = instructionTypes[i],
                    tempTemplateString = templateString,
                    data = [];
                for (var j = 0, len = token.rule.length; j < len; j++) {
                    var result = token.rule[j](tempTemplateString, data);
                    if (result === false) {
                        continue instructionsTypesLoop;
                    }
                    data.push(result[0]);
                    tempTemplateString = result[1];
                }
                instructions.push(token.parse(data));
                templateString = tempTemplateString;
                break;
            }
        }

        if (keepLeftovers && templateString.length) {
            return {
                partial: true,
                instructions: instructions,
                leftovers: templateString
            };
        } else {
            return instructions;
        }
    };
}();

module.exports = {
    compile: compile,
    builders: builders
};


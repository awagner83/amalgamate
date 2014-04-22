
var runtime = require('./runtime.js');

// Instruction constructor: parse name and filter parts here as they are
// common to all instructions.
var Instruction = function(op, name, end, config) {
    var parts = name.split('|');

    config.filters = parts.slice(1);
    config.postFilters = ('' + end).split('|').slice(1);
    config.name = parts[0] === '.' ? [] : parts[0].split('.');

    this.op = op;
    this.data = config;
};

/** Build individual operations to pass to 'render_internal' **/
var builders = {
    replace: function(name) {
        return new Instruction('replace', name, '', {});
    },
    array: function(name, end, tpl) {
        return new Instruction('array', name, end, {tpl: tpl});
    },
    object: function(name, end, tpl) {
        return new Instruction('object', name, end, {tpl: tpl});
    },
    ifSo: function(name, end, tpl, elseTpl) {
        return new Instruction('ifSo', name, end, {tpl: tpl, elseTpl: elseTpl});
    },
    ifNot: function(name, end, tpl, elseTpl) {
        return new Instruction('ifNot', name, end, {tpl: tpl, elseTpl: elseTpl});
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
    var filterFalsey = function(parts) {
        var template = [];
        for (var i = 0, n = parts.length; i < n; i++)
            if (parts[i]) template.push(parts[i]);
        return template;
    };
    var blockInstruction = function(prefix, builder, hasElse) {
        var rule;
        if (hasElse) {
            rule =  [
                skip('{{' + prefix), until('}}'), skip('}}'),
                recurse,
                skip('{{:else}}'),
                recurse,
                skip('{{/'), until('}}'), skip('}}')
            ];
        } else {
            rule =  [
                skip('{{' + prefix), until('}}'), skip('}}'),
                recurse,
                skip('{{/'), until('}}'), skip('}}')
            ];
        }
        return {
            rule: rule,
            parse: function (parts) {
                var subTemplate = filterFalsey(parts[3]);

                var elseTemplate;
                if (hasElse) {
                    elseTemplate = filterFalsey(parts[5]);
                    return builder(parts[1], parts[7], subTemplate,
                            elseTemplate);
                }
                return builder(parts[1], parts[5], subTemplate);
            }
        };
    };
    var instructionTypes = [
        blockInstruction('#', builders.array),
        blockInstruction('@', builders.object),
        blockInstruction('?', builders.ifSo),
        blockInstruction('?', builders.ifSo, true),
        blockInstruction('^', builders.ifNot),
        blockInstruction('^', builders.ifNot, true),

        // Replacements
        {
            rule: [skip('{{'), not('#@?^/:'), until('}}'), skip('}}')],
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


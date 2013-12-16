
var operations, render_internal, render, builders;

/** Functionality behind instruction operations **/
operations = {
    replace: function (ctx, data) {
        return ctx[data];
    },
    deepReplace: function (ctx, data) {
        var result = ctx;
        for (var i = 0, len = data.length; i < len; i++) {
            if (typeof result !== 'object') return ''
            result = result[data[i]];
        }
        return result;
    },
    array: function (ctx, data) {
        var arr = ctx[data.array],
            len = arr.length,
            rendered = Array(len);
        for (var i = 0; i < len; i++) {
            rendered[i] = render_internal(data.template, arr[i]);
        }
        return Array.prototype.concat.apply([], rendered).join('');
    },
    object: function (ctx, data) {
        return render(data.template, ctx[data.object]);
    }

};

/** Build individual operations to pass to 'render_internal' **/
builders = {
    replace: function(name) {
        var splitName = name.split('.');
        if (splitName.length === 1)
            return { op: operations.replace, data: name };
        else
            return { op: operations.deepReplace, data: splitName };
    },
    array: function(array, template) {
        return { op: operations.array, data: { array: array, template: template } };
    },
    object: function(object, template) {
        return { op: operations.object, data: { object: object, template: template } };
    }
};

/** Generate compiled template from template string **/
compile = function() {
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
        }
    };
    var skip = function() {
        var skipParts = Array.prototype.slice.call(arguments, 0);
        return function(string, collected) {
            var skip = composeParts(skipParts, collected);
            if (string.indexOf(skip) === 0) {
                return ['', string.slice(skip.length)];
            }
            return false;
        }
    };
    var instructionTypes = [
        // Ordinary text
        {
            rule: [until('{{')],
            parse: function (parts) {
                return parts[0];
            }
        },

        // Array
        {
            rule: [
                skip('{{#'),
                until('}}'),
                skip('}}'),
                until('{{/', 1, '}}'),
                skip('{{/', 1, '}}')
            ],
            parse: function (parts) {
                return builders.array(parts[1], compile(parts[3]));
            }
        },

        // Object (scope reset)
        {
            rule: [
                skip('{{@'),
                until('}}'),
                skip('}}'),
                until('{{/', 1, '}}'),
                skip('{{/', 1, '}}')
            ],
            parse: function (parts) {
                return builders.object(parts[1], compile(parts[3]));
            }
        },

        // Replacements
        {
            rule: [skip('{{'), until('}}'), skip('}}')],
            parse: function (parts) {
                return builders.replace(parts[1]);
            }
        }
    ];
    return function(templateString) {
        var instructions = [],
            nInstructionTypes = instructionTypes.length;
        while (templateString.length) {
            instructionsTypesLoop:
            for (var i = 0; i < nInstructionTypes; i++) {
                var token = instructionTypes[i],
                    data = [];
                for (var j = 0, len = token.rule.length; j < len; j++) {
                    var result = token.rule[j](templateString, data);
                    if (result === false) {
                        continue instructionsTypesLoop;
                    }
                    data.push(result[0]);
                    templateString = result[1];
                }
                instructions.push(token.parse(data));
            }
        }
        return instructions;
    };
}();

/** Gory rendering details **/
render_internal = function(compiled, context) {
    var len = compiled.length,
        rendered = Array(compiled.length);
    for (var i = 0; i < len; i++) {
        var x = compiled[i];
        if (typeof x === 'object') {
            rendered[i] = x.op(context, x.data);
        } else {
            rendered[i] = x;
        }
    }

    return rendered;
}

/** Render compiled template with given context **/
render = function(compiled, context) {
    // Shortcut for the simplest case
    if(compiled.length == 1 && typeof compiled[0] === 'string') {
        return compiled[0];
    }

    return render_internal(compiled, context).join('');
}


module.exports = {
    render: render,
    compile: compile,
}


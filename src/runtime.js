
var operations, render_internal, render, escape_html, replace_chars, escape_char;

// Escape html chars
replace_regex = /[&<>]/g;
replace_chars = {'<': '&lt;', '>': '&gt;', '&': '&amp;'};
escape_char = function (chr) {
    return replaceChars[chr];
};
escape_html = function (str) {
    if (replace_regex.test(str)) {
        return ('' + str).replace(replace_regex, escape_char);
    } else {
        return str;
    }
};

/** Functionality behind instruction operations **/
operations = {
    replace: function (ctx, data) {
        var result = ctx;
        for (var i = 0, len = data.length; i < len; i++)
            result = result && result[data[i]];
        return escape_html(result);
    },
    filteredReplace: function (ctx, data) {
        var result = operations.replace(ctx, data.name),
            filters = data.filters;
        for (var i = 0, len = filters.length; i < len; i++)
            result = ctx[filters[i]](result);
        return escape_html(result);
    },
    array: function (ctx, data) {
        var arr = ctx[data.array],
            len = arr.length,
            rendered = new Array(len);
        for (var i = 0; i < len; i++)
            rendered[i] = render_internal(data.template, arr[i]);
        return Array.prototype.concat.apply([], rendered).join('');
    },
    object: function (ctx, data) {
        return render(data.template, ctx[data.object]);
    },
    ifSo: function (ctx, data) {
        if (ctx[data.name]) return render(data.template, ctx);
        return '';
    },
    ifNot: function (ctx, data) {
        if (!ctx[data.name]) return render(data.template, ctx);
        return '';
    }
};

/** Gory rendering details **/
render_internal = function(compiled, context) {
    var len = compiled.length,
        rendered = new Array(compiled.length);
    for (var i = 0; i < len; i++) {
        var x = compiled[i];
        if (typeof x === 'object') {
            rendered[i] = x.op(context, x.data);
        } else {
            rendered[i] = x;
        }
    }

    return rendered;
};

/** Render compiled template with given context **/
render = function(compiled, context) {
    // Shortcut for the simplest case
    if(compiled.length == 1 && typeof compiled[0] === 'string') {
        return compiled[0];
    }

    return render_internal(compiled, context).join('');
};

/** Load compiled template into something runnable **/
load = function(frozen) {
    var thawed = [];
    for (var i = 0, len = frozen.length; i < len; i++) {
        if (typeof frozen[i] === 'object') {
            var instruction = frozen[i],
                opFn = operations[instruction.op];
            if (instruction.data && instruction.data.template) {
                var newData = {};
                for (var key in instruction.data) {
                    newData[key] = instruction.data[key];
                }
                newData.template = load(newData.template);
                thawed.push({op: opFn, data: newData});
            } else {
                thawed.push({op: opFn, data: instruction.data});
            }
        } else {
            thawed.push(frozen[i]);
        }
    }
    return thawed;
};

module.exports = {
    render: render,
    load: load
};


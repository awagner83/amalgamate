
// Escape html chars
var replace_regex = /[&<>]/g;
var replace_chars = {'<': '&lt;', '>': '&gt;', '&': '&amp;'};
var escape_char = function (chr) {
    return replaceChars[chr];
};
var escape_html = function (str) {
    if (replace_regex.test(str)) {
        return ('' + str).replace(replace_regex, escape_char);
    } else {
        return str;
    }
};

/** Functionality behind instruction operations **/
var operations = {
    replace: function (val) {
        return escape_html(val);
    },
    array: function (val, data) {
        var len = val.length,
            rendered = new Array(len);
        for (var i = 0; i < len; i++)
            rendered[i] = render_internal(data.tpl, val[i]);
        return [].concat.apply([], rendered).join('');
    },
    object: function (val, data) {
        return render(data.tpl, val);
    },
    ifSo: function (val, data, ctx) {
        return (val && render(data.tpl, ctx)) ||
            (data.elseTpl && render(data.elseTpl, ctx)) || '';
    },
    ifNot: function (val, data, ctx) {
        return (!val && render(data.tpl, ctx)) ||
            (data.elseTpl && render(data.elseTpl, ctx)) || '';
    }
};

/** Gory rendering details **/
var render_internal = function(compiled, context) {
    var len = compiled.length,
        rendered = new Array(len);
    for (var i = 0; i < len; i++) {
        var x = compiled[i];
        if (typeof x === 'object') {
            var localCtx = context,
                name = x.data.name,
                filters = x.data.filters;

            // Navigate to requested context
            for (var j = 0, jlen = name.length; j < jlen; j++)
                localCtx = localCtx && localCtx[name[j]];

            // Apply filters
            for (var k = 0, klen = filters.length; k < klen; k++)
                localCtx = context[filters[k]](localCtx);

            rendered[i] = x.op(localCtx, x.data, context);
        } else {
            rendered[i] = x;
        }
    }

    return rendered;
};

/** Render compiled template with given context **/
var render = function(compiled, context) {
    // Shortcut for the simplest case
    if(compiled.length == 1 && typeof compiled[0] === 'string') {
        return compiled[0];
    }

    return render_internal(compiled, context).join('');
};

/** Load compiled template into something runnable **/
var load = function(frozen) {
    var thawed = [];
    for (var i = 0, len = frozen.length; i < len; i++) {
        if (typeof frozen[i] === 'object') {
            var instruction = frozen[i],
                opFn = operations[instruction.op];
            if (instruction.data && instruction.data.tpl) {
                var newData = {};
                for (var key in instruction.data) {
                    newData[key] = instruction.data[key];
                }
                newData.tpl = load(newData.tpl);
                if (newData.elseTpl) newData.elseTpl = load(newData.elseTpl);
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


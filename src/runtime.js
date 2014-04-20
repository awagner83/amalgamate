
// Escape html chars
var replaceRegex = /[&<>]/g;
var replaceChars = {'<': '&lt;', '>': '&gt;', '&': '&amp;'};
var escapeChar = function (chr) {
    return replaceChars[chr];
};
var escapeHtml = function (str) {
    if (replaceRegex.test(str)) {
        return ('' + str).replace(replaceRegex, escapeChar);
    } else {
        return str;
    }
};

/** Functionality behind instruction operations **/
var operations = {
    replace: escapeHtml,
    array: function (val, data) {
        var len = val.length,
            rendered = new Array(len);
        for (var i = 0; i < len; i++)
            rendered[i] = renderInternal(data.tpl, val[i]);
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
var renderInternal = function(compiled, context) {
    var len = compiled.length,
        rendered = new Array(len);
    for (var i = 0; i < len; i++) {
        var x = compiled[i];
        if (typeof x === 'object') {
            var localCtx = context,
                name = x.data.name,
                filters = x.data.filters,
                postFilters = x.data.postFilters;

            // Navigate to requested context
            for (var j = 0, jlen = name.length; j < jlen; j++)
                localCtx = localCtx && localCtx[name[j]];

            // Apply pre-filters
            for (var k = 0, klen = filters.length; k < klen; k++)
                localCtx = context[filters[k]](localCtx);

            // Run operation
            result = x.op(localCtx, x.data, context);

            // Apply post-filters
            for (var l = 0, llen = postFilters.length; l < llen; l++)
                result = context[postFilters[l]](result);

            rendered[i] = result;

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

    return renderInternal(compiled, context).join('');
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


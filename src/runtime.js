
var operations, render_internal, render, escape_html, replace_chars, escape_char;

// Escape html chars
replace_chars = {'<': '&lt;', '>': '&gt;', '&': '&amp;'};
escape_char = function (chr) {
    return replaceChars[chr];
};
escape_html = function (str) {
    return ('' + str).replace(/[&<>]/g, escape_char);
};

/** Functionality behind instruction operations **/
operations = {
    replace: function (ctx, data) {
        return escape_html(ctx[data]);
    },
    deepReplace: function (ctx, data) {
        var result = ctx;
        for (var i = 0, len = data.length; i < len; i++) {
            if (typeof result !== 'object') return '';
            result = result[data[i]];
        }
        return escape_html(result);
    },
    filteredReplace: function (ctx, data) {
        var result = operations.deepReplace(ctx, data.name),
            filters = data.filters;
        for (var i = 0, len = filters.length; i < len; i++) {
            result = ctx[filters[i]](result);
        }
        return escape_html(result);
    },
    array: function (ctx, data) {
        var arr = ctx[data.array],
            len = arr.length,
            rendered = new Array(len);
        for (var i = 0; i < len; i++) {
            rendered[i] = render_internal(data.template, arr[i]);
        }
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

module.exports = {
    render: render,
    _operations: operations
};



var operations, render_internal, render, builders;

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

    '$rep': builders.replace,
    '$arr': builders.array,
    '$obj': builders.object
}


(function(){function require(e,t){for(var n=[],r=e.split("/"),i,s,o=0;(s=r[o++])!=null;)".."==s?n.pop():"."!=s&&n.push(s);n=n.join("/"),o=require,s=o.m[t||0],i=s[n+".js"]||s[n+"/index.js"]||s[n],r='Cannot require("'+n+'")';if(!i)throw Error(r);if(s=i.c)i=o.m[t=s][e=i.m];if(!i)throw Error(r);return i.exports||i(i,i.exports={},function(n){return o("."!=n.charAt(0)?n:e+"/../"+n,t)}),i.exports};
require.m = [];
require.m[0] = { "src/runtime.js": function(module, exports, require){
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

// Filter application
var filter = function(val, ctx, filters) {
    for (var i = 0, len = filters.length; i < len; i++)
        val = ctx[filters[i]](val);
    return val;
};

/** Functionality behind instruction operations **/
operations = {
    replace: function (ctx, data) {
        var result  = ctx,
            name    = data.name;

        // Traverse to value
        for (var i = 0, len = name.length; i < len; i++)
            result = result && result[name[i]];

        // Apply filters
        if (data.filters.length)
            result = filter(result, ctx, data.filters);

        return escape_html(result);
    },
    array: function (ctx, data) {
        var arr = ctx[data.array],
            len = arr.length,
            rendered = new Array(len);
        for (var i = 0; i < len; i++)
            rendered[i] = render_internal(data.tpl, arr[i]);
        return [].concat.apply([], rendered).join('');
    },
    object: function (ctx, data) {
        return render(data.tpl, filter(ctx[data.object], ctx, data.filters));
    },
    ifSo: function (ctx, data) {
        return (ctx[data.name] && render(data.tpl, ctx)) ||
            (data.elseTpl && render(data.elseTpl, ctx)) || '';
    },
    ifNot: function (ctx, data) {
        return (!ctx[data.name] && render(data.tpl, ctx)) ||
            (data.elseTpl && render(data.elseTpl, ctx)) || '';
    }
};

/** Gory rendering details **/
render_internal = function(compiled, context) {
    var len = compiled.length,
        rendered = new Array(len);
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
            if (instruction.data && instruction.data.tpl) {
                var newData = {};
                for (var key in instruction.data) {
                    newData[key] = instruction.data[key];
                }
                newData.tpl = load(newData.tpl);
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

}};
Amalgamate = require('src/runtime.js');
}());
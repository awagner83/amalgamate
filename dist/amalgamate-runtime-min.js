!function(){function a(b,c){for(var d,e,f=[],g=b.split("/"),h=0;null!=(e=g[h++]);)".."==e?f.pop():"."!=e&&f.push(e);if(f=f.join("/"),h=a,e=h.m[c||0],d=e[f+".js"]||e[f+"/index.js"]||e[f],g='Cannot require("'+f+'")',!d)throw Error(g);if((e=d.c)&&(d=h.m[c=e][b=d.m]),!d)throw Error(g);return d.exports||d(d,d.exports={},function(a){return h("."!=a.charAt(0)?a:b+"/../"+a,c)}),d.exports}a.m=[],a.m[0]={"src/runtime.js":function(a){var b,c,d,e,f,g;replace_regex=/[&<>]/g,f={"<":"&lt;",">":"&gt;","&":"&amp;"},g=function(a){return replaceChars[a]},e=function(a){return replace_regex.test(a)?(""+a).replace(replace_regex,g):a};var h=function(a,b,c){for(var d=0,e=c.length;e>d;d++)a=b[c[d]](a);return a};b={replace:function(a,b){for(var c=a,d=b.name,f=0,g=d.length;g>f;f++)c=c&&c[d[f]];return b.filters.length&&(c=h(c,a,b.filters)),e(c)},array:function(a,b){for(var d=a[b.array],e=d.length,f=new Array(e),g=0;e>g;g++)f[g]=c(b.tpl,d[g]);return[].concat.apply([],f).join("")},object:function(a,b){return d(b.tpl,h(a[b.object],a,b.filters))},ifSo:function(a,b){return a[b.name]&&d(b.tpl,a)||""},ifNot:function(a,b){return!a[b.name]&&d(b.tpl,a)||""}},c=function(a,b){for(var c=a.length,d=new Array(c),e=0;c>e;e++){var f=a[e];d[e]="object"==typeof f?f.op(b,f.data):f}return d},d=function(a,b){return 1==a.length&&"string"==typeof a[0]?a[0]:c(a,b).join("")},load=function(a){for(var c=[],d=0,e=a.length;e>d;d++)if("object"==typeof a[d]){var f=a[d],g=b[f.op];if(f.data&&f.data.tpl){var h={};for(var i in f.data)h[i]=f.data[i];h.tpl=load(h.tpl),c.push({op:g,data:h})}else c.push({op:g,data:f.data})}else c.push(a[d]);return c},a.exports={render:d,load:load}}},Amalgamate=a("src/runtime.js")}();
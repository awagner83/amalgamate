!function(){function a(b,c){for(var d,e,f=[],g=b.split("/"),h=0;null!=(e=g[h++]);)".."==e?f.pop():"."!=e&&f.push(e);if(f=f.join("/"),h=a,e=h.m[c||0],d=e[f+".js"]||e[f+"/index.js"]||e[f],g='Cannot require("'+f+'")',!d)throw Error(g);if((e=d.c)&&(d=h.m[c=e][b=d.m]),!d)throw Error(g);return d.exports||d(d,d.exports={},function(a){return h("."!=a.charAt(0)?a:b+"/../"+a,c)}),d.exports}a.m=[],a.m[0]={"src/runtime.js":function(a){var b,c,d,e,f,g;f={"<":"&lt;",">":"&gt;","&":"&amp;"},g=function(a){return replaceChars[a]},e=function(a){return(""+a).replace(/[&<>]/g,g)},b={replace:function(a,b){return e(a[b])},deepReplace:function(a,b){for(var c=a,d=0,f=b.length;f>d;d++){if("object"!=typeof c)return"";c=c[b[d]]}return e(c)},filteredReplace:function(a,c){for(var d=b.deepReplace(a,c.name),f=c.filters,g=0,h=f.length;h>g;g++)d=a[f[g]](d);return e(d)},array:function(a,b){for(var d=a[b.array],e=d.length,f=new Array(e),g=0;e>g;g++)f[g]=c(b.template,d[g]);return Array.prototype.concat.apply([],f).join("")},object:function(a,b){return d(b.template,a[b.object])},ifSo:function(a,b){return a[b.name]?d(b.template,a):""},ifNot:function(a,b){return a[b.name]?"":d(b.template,a)}},c=function(a,b){for(var c=a.length,d=new Array(a.length),e=0;c>e;e++){var f=a[e];d[e]="object"==typeof f?f.op(b,f.data):f}return d},d=function(a,b){return 1==a.length&&"string"==typeof a[0]?a[0]:c(a,b).join("")},load=function(a){for(var c=[],d=0,e=a.length;e>d;d++)if("object"==typeof a[d]){var f=a[d],g=b[f.op];if(f.data&&f.data.template){var h={};for(var i in f.data)h[i]=f.data[i];h.template=load(h.template),c.push({op:g,data:h})}else c.push({op:g,data:f.data})}else c.push(a[d]);return c},a.exports={render:d,load:load}}},Amalgamate=a("src/runtime.js")}();
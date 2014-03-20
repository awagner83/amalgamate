
runtime = require('./src/runtime.js');

module.exports = {
    compile: require('./src/compiler.js').compile,
    render: runtime.render,
    load: runtime.load
};


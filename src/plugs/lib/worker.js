const jayson = require('jayson')
const h=require('../../helper')
let argv = process.argv,
    appPath = argv.pop(),
    moduleName = argv.pop(),
    type = argv.pop(),
    port = parseInt(argv.pop());


h.getRoutes(appPath, moduleName).then(route => {
    const server = new jayson.server(route, getOptions(type));
    server[type]().listen(port);
})

function getOptions(type = "tcp", options = {}) {
    return Object.assign({
        reviver: reviver,
        replacer: replacer
    }, options);
}
function reviver(key,val) {
    return val;
}
function replacer(key,val) {
    return val;
}
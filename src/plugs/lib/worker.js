const jayson = require('jayson')
const websocket=require('./websocket');
const h=require('../../helper')
const Application=require('../../application')
const app=new Application();
let argv = process.argv,
    appPath = argv.pop(),
    moduleName = argv.pop(),
    type = argv.pop(),
    port = parseInt(argv.pop());

app.getRoutes(appPath, moduleName).then(route => {
    if(type==='websocket'){
        websocket(port,route,app);
        return;
    }
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
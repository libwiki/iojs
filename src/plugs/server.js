const cluster = require('cluster')
const path = require('path')
const jayson = require('jayson')
const h = require('../helper')
const Wscluster = require('../cluster')
module.exports = app=>{
    let options=app.options,
        [protocols, modules] = parsePorts(options.setting);
    app.servers={};
    app.modules = modules;
    app.protocols = protocols;
    const wc = new Wscluster();
    // wc.master((app, next) => {
    //     const server = new jayson.server({
    //         index(app,cb){
    //             cb();
    //         }
    //     });
    //     server.http().listen(3000);
    //     next();
    // })
    wc.once('masterStart', w => {
        for (let item of protocols) {
            let env = {
                exec: path.join(__dirname, './lib/worker'),
                args: [...item, modules.get(item[0]), options.appPath],
            }
            wc.fork(env);
        }
    })
    wc.on('reload', worker => {
        // let workerId=worker.id;
        // let s=app.rpc.getServer()
    })
    wc.on('workerListening', (address, worker) => {
        let port=address.port,
            moduleName=modules.get(port),
            protocol=protocols.get(port);
        pushWorker(moduleName,protocol,port,worker.id);
        console.log(`workerListening ${protocol} ${moduleName}`, address)
        if (wc.listeningCounts === wc.forkCounts) {
            if (app.listened){
                app.emit('reloaded', wc)
            }else{
                app.listened=true;
                app.emit('listened', wc)
            }
            
        }
    })
    app.wscluster=wc;
    wc.run();

    function pushWorker(moduleName,protocol,port,workerId){
        if(app.servers[moduleName]){
            app.servers[moduleName].set(workerId,{protocol,port});
        }else{
            app.servers[moduleName]=new Map([[workerId,{protocol,port}]]);
        }
    }
    function popWorker(moduleName,workerId){
        if(app.servers[moduleName]){
            app.servers[moduleName].delete(workerId);
        }
    }
    function parsePorts(setting={}) {
        let protocols = new Map(),
            modules = new Map(),
            types = new Set(['tcp', 'http']);

        for (let key in setting) {
            let item = setting[key];
            if (!types.has(item.type)) continue;
            if (Array.isArray(item.port)) {
                item.port.forEach(p => {
                    modules.set(p, key);
                    protocols.set(p, item.type);
                })
            } else {
                modules.set(item.port, key)
                protocols.set(item.port, item.type)
            }
        }
        return [protocols, modules];
    }

    
}
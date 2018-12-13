const path = require('path')
const WsCluster = require('ws-cluster-proxy')
module.exports = app=>{
    let options=app.options,
        [protocols, modules] = parsePorts(options.setting),
        servers={};
    
    
    const wc = new WsCluster.cluster();
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
                bindAttribute();
                app.emit('listened', wc)
            }
        }
    })
    
    wc.run();

    function pushWorker(moduleName,protocol,port,workerId){
        if(servers[moduleName]){
            servers[moduleName][workerId]={protocol,port};
        }else{
            servers[moduleName]={[workerId]:{protocol,port}};
        }
    }
    function popWorker(moduleName,workerId){
        if(app.servers[moduleName]){
            delete app.servers[moduleName][workerId];
        }
    }
    function parsePorts(setting={}) {
        let protocols = new Map(),
            modules = new Map(),
            types = new Set(['tcp', 'http','websocket']);

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
    function bindAttribute(){
        app.wscluster=wc;
        app.modules = [...modules];
        app.protocols = [...protocols];
        app.servers = servers;
    }
    
}
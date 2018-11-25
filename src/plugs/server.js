const path = require('path')
const jayson = require('jayson')
const h = require('../helper')
const Wscluster = require('../cluster')
const cluster = require('cluster')
module.exports = (app,next)=>{
    let options=app.options,
        [protocols, modules] = parsePorts(options.setting);
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
    wc.on('masterStart', w => {
        for (let item of protocols) {
            cluster.setupMaster({
                exec: path.join(__dirname, './lib/worker'),
                args: [...item, modules.get(item[0]), options.appPath],
            });
            wc.fork();
        }
    })
    wc.on('workerListening', (address, worker) => {
        console.log(`workerListening ${protocols.get(address.port)} ${modules.get(address.port)}`, address)
        if (wc.listeningCounts === wc.forkCounts) {
            app.emit('listened', app)
        }
    })

    wc.run();
    next();
    
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
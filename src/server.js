const jayson=require('jayson')
const h=require('./helper')
const Wscluster=require('./cluster')
const cluster=require('cluster')


const getOptions_fun=Symbol('getOptions_fun')
const reviver_fun=Symbol('reviver_fun')
const replacer_fun=Symbol('replacer_fun')
module.exports=class Server{
    constructor(app,config={}){
        this.app=app;
        this.config=config;
    }
    run(routes){
        let self=this,[protocols,modules]=self.parsePorts();
        self.app.modules=modules;
        self.app.protocols=protocols;
        const wc=new Wscluster();
        wc.on('masterStart',w=>{
            for(let item of protocols){
                cluster.setupMaster({
                    args: [...item],
                });
                wc.fork();
            }
        })
        wc.on('workerStart',(worker)=>{
            let argv=process.argv,
                type=argv.pop(),
                port=parseInt(argv.pop()),
                options=self[getOptions_fun](type),
                route=self.parseRoutes(routes,modules.get(port),options);
            const server = new jayson.server(route);
            server[type]().listen(port);
        })
        wc.on('workerListening',(address,worker)=>{
            console.log(`workerListening ${protocols.get(address.port)} ${modules.get(address.port)}`,address)
            if(wc.listeningCounts===wc.forkCounts){
                self.app.emit('mounted',self.app)               
            }
        })
        wc.run();
    }
    parsePorts(){
        let protocols=new Map(),
            modules=new Map(),
            types=new Set(['tcp','http']),
            config=this.config;

        for(let key in config){
            let item=config[key];
            if(!types.has(item.type))continue;
            if(Array.isArray(item.port)){
                item.port.forEach(p=>{
                    modules.set(p,key);
                    protocols.set(p,item.type);
                })
            }else{
                modules.set(item.port,key)
                protocols.set(item.port,item.type)
            }
        }
        return [protocols,modules];
    }
    parseRoutes(routes={},moduleName){
        if(!moduleName){
            return routes;
        }
        let route={};
        for(let i in routes){
            if(i.indexOf(moduleName)===0){
                route[i]=routes[i];
            }
        }
        return route;
    }   
    [getOptions_fun](type="tcp",options={}){
        return Object.assign({
            reviver:this[reviver_fun](type),
            replacer:this[replacer_fun](type)
        },options);
    }
    [reviver_fun](type){
        return JSON.parse;
    }
    [replacer_fun](type){
        return JSON.stringify;
    }
}
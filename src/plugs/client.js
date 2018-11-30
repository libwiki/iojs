const path = require('path')
const {client} = require('jayson')
const h = require('../helper')
module.exports = app=>{
    const request_fun=Symbol('request_fun')
    const parse_route_fun=Symbol('parse_route_fun')
    app.rpc={
        request(route,data){
            return this[request_fun](route,data);
        },
        notify(route,data){
            return this[request_fun](route,data,true);
        },
        getServer(moduleName){
            const servers=app.servers;
            if(!moduleName)return servers;
            return servers[moduleName];
        },
        [request_fun](route,data,isNotify=false){
            return new Promise((resolve,reject)=>{
                let [port,protocol]=this[parse_route_fun](route);
                if(!port||!protocol){
                    reject('Routing does not exist');
                }
                let argv=[route,data];
                if(isNotify){
                    argv.push(null);
                }
                argv.push((err,res)=>{
                    if(err)reject(err);
                    if(!isNotify)resolve(res);
                });
                client[protocol]({port}).request(...argv)
            })
        },
        [parse_route_fun](routes){
            let moduleName=routes.split('.')[0],
                servers=this.getServer(moduleName);
            // 负载均衡待完善
            for(let i in servers){
                servers=servers[i];
                break;
            }
            return [servers.port,servers.protocol];
        }
    }
}
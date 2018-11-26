const _ = require('lodash')
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
        [request_fun](route,data,isNotify=false){
            return new Promise((resolve,reject)=>{
                let [port,type]=this[parse_route_fun](route);
                if(!port||!type){
                    return reject('Routing does not exist');
                }
                let argv=[route,data];
                if(isNotify){
                    argv.push(null);
                }
                argv.push((err,res)=>{
                    if(err)reject(err);
                    if(!isNotify)resolve(res);
                });
                client[type]({port}).request(...argv)
            })
        },
        [parse_route_fun](routes){
            let port,
                type,
                route=routes.split('.')[0],
                protocols=app.protocols,
                modules=app.modules;
            for(let item of modules){
                if(route===item[1]){
                    port=item[0];
                    break;
                }
            }
            if(port){
                type=protocols.get(port)
            }
            return [port,type];
        }
    }
}
const path=require('path')
const cluster=require('cluster')
const {EventEmitter}=require('events')
const h=require('./helper')

const init_fun=Symbol('init_fun')

const report_signal='_app_report_signal';
const sync_signal='_app_sync_signal';
const isAsyncMessage=Symbol('isAsyncMessage');

class Application extends EventEmitter{
    constructor(options={}){
        super();
        this[isAsyncMessage]=false;
        this.options=Object.assign({
            appPath:path.join(__dirname,'../app/'),
            setting:{},
        },options);

        this.plugs=['client'];
        
        this[init_fun]();
    }
    run(){
        return this.plug(require(`./plugs/server`));
    }
    plug(fn){
        if (typeof fn !== 'function') throw new TypeError('Plug must be composed of functions!');
        fn(this);
        return this;
    }
    onerror(err) {
        if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

        if (404 == err.status || err.expose) return;
        if (this.silent) return;

        const msg = err.stack || err.toString();
        console.error();
        console.error(msg.replace(/^/gm, '  '));
        console.error();
    }
    
    // 上报信息 
    report(key,value){
        if(cluster.isMaster)return;
        process.send({
            signal:report_signal,
            params:{
                key,
                value,
            }
        })
        console.count(`report__${key}`)
    }
    // 同步信息
    sync(key,value,worker){
        if(cluster.isWorker)return;
        if(worker){
            worker.send({
                signal:sync_signal,
                params:{
                    key,
                    value,
                }
            })
            return;
        }
        let workers=cluster.workers;
        for (let i in workers) {
            workers[i].send({
                signal:sync_signal,
                params:{
                    key,
                    value,
                }
            })
        }
    }
    syncReloaded(worker){
        if(cluster.isWorker)return;
        let params=[],keys=Object.getOwnPropertyNames(this);
        keys.forEach(key=>{
            this.sync(key,this[key],worker);
        })
    }
    onMessage({signal,params}){
        if(signal===report_signal){
            this[params.key]=params.value;
        }else if(signal===sync_signal){
            this[isAsyncMessage]=true;
            this[params.key]=params.value;
        }
    }

    /**
     * 获取模块下所有类的引用
     */
    async getModulesFiles(filePath, dirArr) {
        if (!dirArr){
            if (!h.isExist(filePath)) return Promise.resolve({});
            let res = await h.readdir(filePath, false).catch(err => {throw err})
            if (!res.dir) {
                return Promise.resolve({});
            }
            dirArr=res.dir;
        }
        let p = [], dirs = [];
        if (Array.isArray(dirArr)){
            dirArr.forEach(dir => {
                dirs.push(dir);
                p.push(h.readdir(path.join(filePath, dir), false));
            })
        }else{
            dirs = [dirArr];
            p=[h.readdir(path.join(filePath, dirArr), false)];
        }
        
        
        let files = {},
            res = await Promise.all(p).catch(err => {throw err});

        res.forEach((v, i) => {
            if (v.file) {
                let item = {}
                v.file.forEach(f => {
                    item[path.basename(f, path.extname(f))] = path.join(v.filePath, f);
                })
                files[dirs[i]] = item;
            }
        })
        return Promise.resolve(files);

    }
    /**
     * 获取类公共方法
     * @param {class} C 导出的类
     */
    bindFunction(C) {
        let obj = {},
            instance = new C(this),
            classNames = Object.getOwnPropertyNames(C.prototype);
        classNames.forEach(name => {
            if (name !== 'constructor') {
                obj[name] = instance[name].bind(instance);
            }
        })
        return obj;
    }
    /**
     * 通过类的引用获取所有模块的整体路由（实现joysonjs路由格式）
     */
    async getRoutes(filePath, dirArr) {
        let self = this,
            routes = {},
            files = await self.getModulesFiles(filePath, dirArr).catch(err =>  {throw err});
        for (let m in files) {
            let modules = files[m];
            for (let n in modules) {
                let filePath = modules[n],
                    C = require(filePath);
                if (typeof C === 'function') {
                    let f = self.bindFunction(C);

                    for (let action in f) {
                        routes[`${m}.${n}.${action}`] = f[action];
                    }
                    // if(!routes[m]){
                    //     routes[m]={}
                    // }
                    //routes[m][n]=f;
                }
            }
        }
        return Promise.resolve(routes);
    }

    [init_fun](){
        let plugs=this.plugs;
        plugs.forEach(file=>{
            this.plug(require(`./plugs/${file}`));
        })
    }
}
module.exports = {Application,isAsyncMessage}
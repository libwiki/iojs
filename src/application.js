const path=require('path')
const WsCluster=require('ws-cluster-proxy')
const h=require('./helper')
class Application extends WsCluster.events{
    constructor(options={}){
        super()
        this.options=Object.assign({
            appPath:path.join(__dirname,'../app/'),
            setting:{},
        },options);

        let plugs=['client'];
        this.plugs=plugs;
        plugs.forEach(file=>{
            this.plug(require(`./plugs/${file}`));
        })
    }
    run(){
        this.plug(require(`./plugs/server`));
        process.nextTick(_=>{
            this.emit('runing');
        })
        return this;
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
}

module.exports = WsCluster.proxy(Application)
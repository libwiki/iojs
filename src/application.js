const path=require('path')
const {EventEmitter}=require('events')
const h=require('./helper')
const Server=require('./server')

module.exports=class Application extends EventEmitter{
    constructor(options={}){
        super();
        this.options=Object.assign({
            appPath:path.join(__dirname,'../app/'),
            config:{},
        },options);

        this.modules=null;
        this.protocols=null;
        this.run();
    }
    run(){
        this.getRoutes().then(routes=>{
            let server=new Server(this,this.options.config);
            server.run(routes);
        }).catch(err=>h.logger)
        
    }
    /**
     * 通过类的引用获取所有模块的整体路由（实现joysonjs路由格式）
     */
    async getRoutes(){
        let self=this,
            routes={},
            files=await self.getModulesFiles().catch(err=>h.logger);
        for(let m in files){
            let modules=files[m];
            for(let n in modules){
                let filePath=modules[n],
                    C=require(filePath);
                if(typeof C==='function'){
                    let f=self.bindFunction(C);
                    
                    for(let action in f){
                        routes[`${m}.${n}.${action}`]=f[action];
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
    /**
     * 获取模块下所有类的引用
     */
    async getModulesFiles(){
        let filePath=this.options.appPath;
        if(!h.isExist(filePath))return Promise.resolve({});
        let res= await h.readdir(filePath,false).catch(err=>h.logger)
        if(!res.dir){
            return Promise.resolve({});
        }
        
        let p=[],dirs=[];
        res.dir.forEach(dir=>{
            dirs.push(dir)
            p.push(h.readdir(path.join(filePath,dir),false)) 
        })
        let files={};
        res=await Promise.all(p).catch(err=>h.logger);
        
        res.forEach((v,i)=>{
            if(v.file){
                let item={}
                v.file.forEach(f=>{
                    item[path.basename(f,path.extname(f))]=path.join(v.filePath,f);
                })
                files[dirs[i]]=item;
            }
        })
        return Promise.resolve(files); 
        
    }
    /**
     * 获取类公共方法
     * @param {class} C 导出的类
     */
    bindFunction(C){
        let obj={},
            instance=new C(this),
            classNames=h.getClassNames(C);
        classNames.forEach(name=>{
            if(name!=='constructor'){
              obj[name]=instance[name].bind(instance);
            }
        })
        return obj;
    }
}
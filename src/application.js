const path=require('path')
const h=require('./helper')

module.exports=class Application{
    constructor(options={}){
        this.options=Object.assign({
            appPath:'../app/',
            server:null,
        },options);
    }
    async getInstances(){
        let filePath=this.options.appPath;
        if(h.isExist(filePath))return Promise.resolve({});
        let res= await h.readdir(filePath,false).catch(res=>h.logger)
        if(!res.dir){
            return Promise.resolve({});
        }
        let self=this.bindFunction;
        let p=[];
        res.dir.forEach(dir=>{
            p.push(h.readdir(path.join(filePath,dir),false)) 
        })
        let files=[], 
            res=Promise.all(p).catch(res=>h.logger);

        for(let i of res){
            if(res.file){
                let _dirname=res.filePath;
                let _f=res.file.map(f=>{
                    return path.join(_dirname,f) 
                })
                files.push(..._f)
            }
        }
        if(!files.length){
            return Promise.resolve({}); 
        }
        files.forEach(file=>{
            if(path.extname(file)==='.js'){
                let C=require(file);
                let obj=self.bindFunction(C);
            }
        })
        
    }
    bindFunction(C){
        let obj={},
            instance=new C(this.options.server),
            classNames=h.getClassNames(C);
        classNames.forEach(name=>{
            if(name!=='constructor'){
              obj[name]=instance[name].bind(instance);
            }
        })
        return obj;
    }
}
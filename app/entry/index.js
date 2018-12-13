const cluster=require('cluster')
module.exports=class Entry{
    constructor(app){
        this.app=app;
    }
    index(argv,cb){
        this.app.rpc.request('chat.index.join',['chat','index','join','function']).then(res=>{
            console.log(res)

        })
        console.log(this.app._io)
        cb(null, argv);
    }
    
}
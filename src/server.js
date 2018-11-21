const joyson=require('jayson')
const h=require('./helper')

const init_fun=Symbol('_init_fun')
module.exports=class Server extends joyson.Server{
    constructor(options){
        super(options);
        this[init_fun]();
    }
    [init_fun](){
        this.on('http request',req=>{
            req.on('data',data=>{
                this.body=data;
                console.log(data)
            })
        })
    }
    
}
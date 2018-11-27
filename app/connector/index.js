module.exports=class Connector{
    constructor(app){
        this.app=app;
    }
    connect(data,socket,io){
        console.log(this.app);
    }
    close(argv,cb){
        cb(null, argv);
    }
}
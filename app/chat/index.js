module.exports=class Chat{
    constructor(app){
        this.app=app;
    }
    join(argv,cb){
        cb(null, argv);
    }
    leave(argv,cb){
        cb(null, argv);
    }
}
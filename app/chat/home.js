module.exports=class Chat{
    constructor(app){
        this.app=app;
    }
    join2(argv,cb){
        cb(null, argv);
    }
    leave2(argv,cb){
        cb(null, argv);
    }
}
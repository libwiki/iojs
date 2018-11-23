module.exports=class Entry{
    constructor(app){
        this.app=app;
    }
    index(argv,cb){
        cb(null, argv);
    }
    
}
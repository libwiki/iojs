module.exports=class Connector{
    constructor(app){
        this.app=app;
    }
    connect(data,socket,io){
        socket.send('123123123123')
        console.log(this.app);
    }
    close(argv,cb){
        cb(null, argv);
    }
}
const ws=require('ws')
module.exports=function(port,route){
    let index=1;
    const io=new ws.Server({port,clientTracking:false})
    io.id=port;
    io.connectors=new Map();
    process.send({signal:'websocket.io',io})
    io.on('connection',(socket,req)=>{
        socket.id=port+100000+index++;
        io.connectors.set(socket);
        socket.on('message',data=>{
            if(data&&typeof data==='string'){
                try {
                    data=JSON.parse(data);
                } catch (error) {
                    console.log(error)
                }
            }
            if(data.method){
                let fn=route[data.method];
                
                if(typeof fn ==='function'){
                    fn(socket,data.params,io);
                }else{
                    io.emit(data.method,data.params,socket,io);
                }
            }
        })
        socket.on('close',(code,reason)=>{
            io.connectors.delete(socket.id)
            io.emit('socket.close',socket,code,reason);
        })
        socket.on('error',(err)=>{
            io.connectors.delete(socket.id)
            io.emit('socket.error',socket,err);
        })
        socket.on('ping',(data)=>{
            socket.pong(data);
        })
    })
    io.on('close',_=>{
        io.connectors=new Map();
    })
    io.on('error',_=>{
        io.connectors=new Map();
    })
    io.on('listening',_=>{
        console.log(`workerListening websocket connector port：${port}`)
    })
    return io;
}


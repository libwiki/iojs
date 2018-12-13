const ws=require('ws')
module.exports=function(port,route,app){
    let index=1;
    const io=new ws.Server({port,clientTracking:false})
    io.id=port;
    if (!app.socketIds){
        app.socketIds={}
    }
    let connectors=new Map();
    process.send({signal:'websocket.io',io})
    
    app.on('listened', wc=>{
        console.log('websocket.listened')
    })
    io.on('connection',(socket,req)=>{
        let id = port + 100000 + index++;
        socket.id = id;
        app.socketIds[id]=port;
        connectors.set(socket.id,socket);
        console.log(socket)
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
                    fn(data.params, socket, io);
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
        //console.log(`workerListening websocket connector port：${port}`)
    })
    app._io=io;
    return io;
}


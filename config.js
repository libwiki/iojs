module.exports={
    entry: {
        type:"http",
        port:3030
    },
    connector:{
        type:"websocket",
        port:[5001,5002,5003,5004]
    },
    api:{
        type:"http",
        port:[6001,6002,6003,6004]
    },
    chat:{
        type:"tcp",
        port:[7001,7002,7003,7004]
        
    }
}
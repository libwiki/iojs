const cluster=require('cluster')
const config=require('./config')
const path=require('path')
const h = require('./src/helper');
const application = require('./src/application');
const app = new application(config);
console.log('=========================== created ......')
app.on('listened',a=>{
    console.log('=========================== listened ......')
    //app.wscluster.reload()
    // console.log(app.modules)
    // console.log(app.protocols)
    // app.rpc.request('entry.index.index',{title:'您好!',body:'这是内容'}).then(res=>{
    //     console.log(res)
    // }).catch(err=>{
    //     console.log(err)
    // })
})
app.once('reloaded',_=>{
    console.log('=========================== reloaded ......')
})



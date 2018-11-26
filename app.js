const cluster=require('cluster')
const config=require('./config')
const path=require('path')
const _=require('lodash')
const h = require('./src/helper');
const application = require('./src/application');
const app = new application(config);
console.log('=========================== created ......')
app.on('listened',a=>{
    console.log('=========================== listened ......')
    // console.log(app.modules)
    // console.log(app.protocols)
    // app.rpc.request('entry.index.index',{title:'您好!',body:'这是内容'}).then(res=>{
    //     console.log(res)
    // }).catch(err=>{
    //     console.log(err)
    // })
})



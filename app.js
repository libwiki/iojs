const cluster=require('cluster')
const config=require('./config')
const path=require('path')
const _=require('lodash')
const h = require('./src/helper');
console.log(h.time(),h.dateFormat(null,'Y-m-d H:i'),h.date())
return ;
const application = require('./src/application');
const app=new application({config});
app.on('mounted',a=>{
    console.log('=========================== listening end。。。')
})

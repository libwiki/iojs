const cluster=require('cluster')
const config=require('./config')
const path=require('path')
const _=require('lodash')
const h = require('./src/helper');
console.log('aaaaaaaaaaaaaaaaa')
const application = require('./src/application');
const app = new application(config);
console.log('=========================== created ......')
app.on('listened',a=>{
    console.log('=========================== listened ......')
})



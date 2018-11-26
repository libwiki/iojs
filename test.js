const _ = require('lodash')
const cluster = require('cluster')
const path = require('path')
const h = require('./src/helper')
const Wscluster = require('./src/cluster')
const jayson = require('jayson')
let reviver=JSON.parse
let str={a:1};
// let obj = JSON.stringify.apply(JSON, _.compact([str, [reviver]]));
// console.log(_.compact([str, reviver]))
// return;
const rpc=jayson.client.http({port:3030});
rpc.request('entry.index.index',{a:1,b:2},(err,res)=>{
    console.log(err,res)
})
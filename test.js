const cluster = require('cluster')
const path = require('path')
const h = require('./src/helper')
const Wscluster = require('./src/cluster')
const jayson = require('jayson')
h.getRoutes(path.join(__dirname, 'app'), ['connector']).then(res=>{
    console.log(res)
})
return ;
const wc = new Wscluster();
run();
function run() {
    const wc = new Wscluster();
    var protocols=[4001,4002,4003,4004]
    for (let item of protocols) {

        wc.master((app, next) => {
            cluster.setupMaster({
                exec: __filename,
                args: [item],
            });
            app.fork();
            next();
        })
    }
    wc.on('workerListening', (address, worker) => {
        console.log(`workerListening`, address)
        if (wc.listeningCounts === wc.forkCounts) {
            console.log('mounted')
        }
    })
    wc.run();
}


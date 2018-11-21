const config=require('./config')
const h = require('./src/helper');
const application = require('./src/application');
const Server = require('./src/server');
var server=new Server({
    add(args, callback) {
        console.log('add:',this.body)
        callback(null, args);
    }
});
console.log(h.getClassNames(application))
//server.http().listen(3030);
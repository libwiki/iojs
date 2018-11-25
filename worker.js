const jayson = require('jayson')
let argv = process.argv,
    port = parseInt(argv.pop());
const server = new jayson.server();
server.http().listen(port);
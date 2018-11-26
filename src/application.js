const path=require('path')
const {EventEmitter}=require('events')
const h=require('./helper')

const init_fun=Symbol('init_fun')
module.exports=class Application extends EventEmitter{
    constructor(options={}){
        super();
        this.options=Object.assign({
            appPath:path.join(__dirname,'../app/'),
            setting:{},
        },options);

        this.plugs=['server','client'];
        
        this[init_fun]();
    }

    plug(fn){
        if (typeof fn !== 'function') throw new TypeError('Plug must be composed of functions!');
        fn(this);
        return this;
    }
    onerror(err) {
        if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

        if (404 == err.status || err.expose) return;
        if (this.silent) return;

        const msg = err.stack || err.toString();
        console.error();
        console.error(msg.replace(/^/gm, '  '));
        console.error();
    }
    [init_fun](){
        let plugs=this.plugs;
        plugs.forEach(file=>{
            this.plug(require(`./plugs/${file}`));
        })
        
    }
}
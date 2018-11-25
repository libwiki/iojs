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

        this.plugs=[];
        
        this[init_fun]();
    }

    use(fn){
        if (typeof fn !== 'function') throw new TypeError('Plug must be composed of functions!');
        this.plugs.push(fn);
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
        let plugsDirPath=path.join(__dirname, 'plugs'),
            plugsDir = h.readdirSync(plugsDirPath,false);
        if(plugsDir.file){
            plugsDir.file.forEach(file=>{
                this.plugs.unshift(require(path.join(plugsDirPath, file)));
            })
        }
        
        /**
         * running plugs
         */
        const fn = h.compose(this.plugs);
        fn(this);
        
    }
}
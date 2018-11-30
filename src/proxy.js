const {Application,isAsyncMessage}=require('./application')
module.exports=options=>{
    return new Proxy(new Application(options),{
        set(target, propKey,value, receiver){
            if(isAsyncMessage!==propKey){
                if(!Object.is(Reflect.get(target, propKey),value)){
                    target.sync(propKey,value);
                    if(!Reflect.get(target, isAsyncMessage)&&propKey.indexOf('_')!==0){
                        target.report(propKey,value);
                    }
                }
                Reflect.set(target, isAsyncMessage,false)
            }
            return Reflect.set(target, propKey,value, receiver)
        },
        deleteProperty (target, propKey) {
            if(isAsyncMessage!==propKey){
                if(Reflect.get(target, propKey)!==undefined){
                    target.sync(propKey,undefined);
                    if(!Reflect.get(target, isAsyncMessage)&&Reflect.get(target, propKey)!==undefined){
                        target.report(propKey,undefined);
                    }
                }
                Reflect.set(target, isAsyncMessage,false)
            }
            return Reflect.deleteProperty(target, propKey);
        }
        
    })
}

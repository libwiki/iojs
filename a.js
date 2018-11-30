class Application{
    constructor(){

    }
}
const isAsyncMessage='aaaaa';
const Obj=new Proxy( Application,{
    construct(target,args){
        console.count('construct')
        return new target(...args);
        return Reflect.construct(target, args)
    },
    // set(target, propKey,value, receiver){
    //     console.count(`set ________________ ${propKey}`)
    //     return target[propKey];
    //     return Reflect.set(target, propKey,value, receiver)
    // },
    set: function(obj, prop, value) {
        if (prop === 'age') {
          if (!Number.isInteger(value)) {
            throw new TypeError('The age is not an integer');
          }
          if (value > 200) {
            throw new RangeError('The age seems invalid');
          }
        }
    
        // 对于满足条件的 age 属性以及其他属性，直接保存
        obj[prop] = value;
      }
    
})

var app=new Obj();
app.a;
app.age='bbbbbbbbbbbb';
const os = require('os');
const fs=require('fs')
const util=require('util')
const path=require('path')
const crypto = require('crypto');

module.exports={
    logger(level='info',...argv){
        let l=new Set(['info','error'])
        if(l.has(level)){
            console.log(...argv)
        }else{
            console.log(level,...argv)
        }
    },

    md5(str,charset='utf8'){
        return crypto.createHash('md5').update(str + '', charset).digest('hex');
    },

    isExist(filePath){
        try {
            return fs.existsSync(filePath);
        }catch(e){
            return false;
        }
    },

    isFile(filePath){
        if (!this.isExist(filePath)) return false;
        try {
            return fs.statSync(filePath).isFile();
        } catch (e) {
            return false;
        }
    },

    isDir(filePath){
        if (!this.isExist(filePath)) return false;
        try {
            return fs.statSync(filePath).isDirectory();
        } catch (e) {
            return false;
        }
    },

    isObject(obj){
        return toString.call(obj) === '[object Object]';
    },

    async readdir(filePath, isClutter = true){
        try {
            let files=await util.promisify(fs.readdir)(filePath);
            if(isClutter)return files;
            let res={ filePath };
            files.forEach(file=>{
                let filename=path.join(filePath,file)
                if(this.isFile(filename)){
                    res.file?res.file.push(file):res.file=[file];
                }else{
                    res.dir?res.dir.push(file):res.dir=[file];
                }
            });
            
            return res;
        } catch (e) {
            return e;
        }
        
    },
    readdirSync(filePath, isClutter = true){
        try {
            let files = fs.readdirSync(filePath);
            if (isClutter) return files;
            let res = { filePath };
            files.forEach(file => {
                let filename = path.join(filePath, file)
                if (this.isFile(filename)) {
                    res.file ? res.file.push(file) : res.file = [file];
                } else {
                    res.dir ? res.dir.push(file) : res.dir = [file];
                }
            });

            return res;
        } catch (e) {
            return e;
        }
    },

    ip(type=4,onlyIp=true){
        let networkInterfaces=os.networkInterfaces();
        let res={
            ip4:{
                mac:[],
                address:[],
                netmask:[],
                cidr:[],
            },
            ip6:{
                mac:[],
                address:[],
                netmask:[],
                cidr:[],
            },
        };
        Object.values(networkInterfaces).forEach(item=>{
            for(let v of item){
                if(v.family==='IPv4'){
                    res.ip4.mac.push(v.mac)
                    res.ip4.address.push(v.address)
                    res.ip4.netmask.push(v.netmask)
                    res.ip4.cidr.push(v.cidr)
                }else if(v.family==='IPv6'){
                    res.ip6.mac.push(v.mac)
                    res.ip6.address.push(v.address)
                    res.ip6.netmask.push(v.netmask)
                    res.ip6.cidr.push(v.cidr)
                }
            }
        })
        if(type==4){
            let rs=res.ip4;
            return onlyIp?rs.address[0]:rs;
        }else if(type==6){
            let rs=res.ip6;
            return onlyIp?rs.address[0]:rs;
        }
        res.hostname=os.hostname();
        return res;
    },

    escapeHtml(str){
        return (str + '').replace(/[<>'"]/g, a => {
            switch (a) {
                case '<':
                return '&lt;';
                case '>':
                return '&gt;';
                case '"':
                return '&quote;';
                case '\'':
                return '&#39;';
            }
        });
    },
    trim(str) {
        if(typeof str!=='string'){
          return str;
        }
        let resultStr = str.replace(/(^\s*)|(\s*$)/g,""); //去掉空格
        resultStr = resultStr.replace(/(^[\r\n]*)|([\r\n]*$)/g,""); //去掉回车换行
        return resultStr;
    },
    /**
     * 前置补 '0' 操作
     * @param  {Number|String} num|string 数值
     * @param  {Number} length 总长度
     * @param  {String} char   补值
     * @return {String}        
     */
    prefixInteger(num, length,char='0') {
        return(Array(length).join(char)+num).slice(-length);
    },
    /**
     * 日期格式化 
     * @param  {Array|String} date  由date()函数获得的时间数组、时间、时间戳(int)
     * @param  {String} format    格式
     * @return {String}           
     */
    dateFormat(date,format='Y-m-d H:i:s'){
        let defaultVal=date;
        if(date===null||typeof date!=='object'){
            date=this.date(date);
        }
        let o={
            Y:0,
            y:0,
            m:11,
            d:2,
            H:3,
            h:3,
            i:4,
            s:5,
        };
        Object.keys(o).forEach(key=>{
            format=format.replace(key,date[o[key]]);
        });
        if(format.indexOf('NaN')===-1){
            return format;
        }
        return defaultVal;
    },
    /**
     * 由日期获取 获取时间戳
     * @param  {Number|String} val 默认为当前时间
     * @param  {Boolean} type 是否进行转化
     * @return {int}       
     */
    time(val=null,type=false){
        if(val===0)return 0;
        if(val===null){
            return Date.now();
        }
        if(typeof val === 'number'){
            return val;
        }else if(typeof val === 'string'){
            val=val+' ';
        }
        let date=new Date(val),time=date.getTime();
        return Number.isNaN(time)?0:time;
    },
    /**
     * 获取日期信息的数组
     * @param  {Number|String} val 默认为当前时间
     * @param  {mixed} isGetWeek 如果希望获取当前月一号的星期数可传 [ 0 | undefined | false ]
     * @return {Array}     
     */
    date(val=null,isGetWeek=null){
        if(val===null){
            val=Date.now();
        }else if(typeof val === 'string'){ //这里指时间格式的字符串 例：2018-08-08
            val=val+' '; 
        }
        let date=new Date(val);
        // 防止多次递归调用
        if(isGetWeek){
            return date.getDay();
        }
        let dayNums=[31,28,31,30,31,30,31,31,30,31,30,31],
        dateArray=[
            date.getFullYear(),//0. 年份(4位)
            this.prefixInteger(date.getMonth(),2),//1. 月份(0~11)
            this.prefixInteger(date.getDate(),2),//2. 1~31
            this.prefixInteger(date.getHours(),2),//3. 小时(0~23)
            this.prefixInteger(date.getMinutes(),2),//4. 分钟(0-59)
            this.prefixInteger(date.getSeconds(),2),//5. 秒数(0-59)
            date.getMilliseconds(),//6. 毫秒数(0-999)
            date.getTime(),//7. 总毫秒(时间戳)
            date.getDay(),//8. 星期(0~6)
        ];
        //9. 是否闰年
        if(dateArray[0]%4===0&&dateArray[0]%100!==0||dateArray[0]%400===0){
            dateArray.push(true);
        }else{
            dateArray.push(false);
        }
        //10. 当月天数
        if(dateArray[9]&&parseInt(dateArray[1])===1){
            dateArray.push(29);
        }else{
            dateArray.push(dayNums[parseInt(dateArray[1])]);
        }

        //11. 月份（1~12）
        dateArray.push(this.prefixInteger(parseInt(dateArray[1])+1,2));
        if(isGetWeek===null){
            return dateArray;
        }

        //12. 当月一号 星期数（0~6）
        if(parseInt(dateArray[2])===1){
            dateArray.push(dateArray[8]);
        }else{
            let d=this.date(parseInt(dateArray[0])+'-'+(parseInt(dateArray[1])+1)+'-1',true);
            dateArray.push(d);
        }
                        
        return dateArray;
    },
    getClassNames(app){
        return Object.getOwnPropertyNames(app.prototype);
    },
    /**
     * 获取模块下所有类的引用
     */
    async getModulesFiles(filePath, dirArr) {
        if (!dirArr){
            if (!this.isExist(filePath)) return Promise.resolve({});
            let res = await this.readdir(filePath, false).catch(err => this.logger)
            if (!res.dir) {
                return Promise.resolve({});
            }
            dirArr=res.dir;
        }
        let p = [], dirs = [];
        if (Array.isArray(dirArr)){
            dirArr.forEach(dir => {
                dirs.push(dir);
                p.push(this.readdir(path.join(filePath, dir), false));
            })
        }else{
            dirs = [dir];
            p=[this.readdir(path.join(filePath, dir), false)];
        }
        
        
        let files = {};
        res = await Promise.all(p).catch(err => this.logger);

        res.forEach((v, i) => {
            if (v.file) {
                let item = {}
                v.file.forEach(f => {
                    item[path.basename(f, path.extname(f))] = path.join(v.filePath, f);
                })
                files[dirs[i]] = item;
            }
        })
        return Promise.resolve(files);

    },
    /**
     * 获取类公共方法
     * @param {class} C 导出的类
     */
    bindFunction(C) {
        let obj = {},
            instance = new C(this),
            classNames = this.getClassNames(C);
        classNames.forEach(name => {
            if (name !== 'constructor') {
                obj[name] = instance[name].bind(instance);
            }
        })
        return obj;
    },
    /**
     * 通过类的引用获取所有模块的整体路由（实现joysonjs路由格式）
     */
    async getRoutes(filePath, dirArr) {
        let self = this,
            routes = {},
            files = await self.getModulesFiles(filePath, dirArr).catch(err => self.logger);
        for (let m in files) {
            let modules = files[m];
            for (let n in modules) {
                let filePath = modules[n],
                    C = require(filePath);
                if (typeof C === 'function') {
                    let f = self.bindFunction(C);

                    for (let action in f) {
                        routes[`${m}.${n}.${action}`] = f[action];
                    }
                    // if(!routes[m]){
                    //     routes[m]={}
                    // }
                    //routes[m][n]=f;
                }
            }
        }
        return Promise.resolve(routes);
    },
    /**
     * https://github.com/koajs/compose/blob/master/index.js
     * @param {Array} middleware
     * @return {Function}
     * @api public
     */
    compose(middleware) {
        if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
        /**
         * @param {Object} context
         * @return {Promise}
         * @api public
         */
        return function (context, next) {
            // last called middleware #
            let index = -1
            return dispatch(0)
            function dispatch(i) {
                if (i <= index) return Promise.reject(new Error('next() called multiple times'))
                index = i
                let fn = middleware[i]
                if (i === middleware.length) fn = next
                if (!fn) return Promise.resolve()
                try {
                    let argv = [dispatch.bind(null, i + 1)];
                    if (context) argv.unshift(context);
                    return Promise.resolve(fn.apply(this, argv));
                } catch (err) {
                    return Promise.reject(err)
                }
            }
        }
    },
}

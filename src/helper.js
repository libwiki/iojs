const os = require('os');
const fs=require('fs')
const util=require('util')
const path=require('path')
const crypto = require('crypto');

module.exports={

    logger(str,level='info'){
        console.log(str)
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
                let filePath=path.join(filePath,file)
                if(this.isFile(filePath)){
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

    getClassNames(app){
        return Object.getOwnPropertyNames(app.prototype);
    },
}

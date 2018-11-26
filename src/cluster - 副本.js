const cluster = require('cluster')
const assert = require('assert').strict
const { EventEmitter } = require('events')

const get_worker_fun = Symbol('_getWorker');
const init_fun = Symbol('init');
const master_fun = Symbol('master');
const worker_fun = Symbol('worker');
const worker_bind_fun = Symbol('worker_bind');


const WORKER_FORK_SIGNAL = 'worker_fork_signal';
const WORKER_RELOAD_SIGNAL = 'worker_reload_signal';

module.exports = class Main extends EventEmitter {
    constructor() {
        super();
        this.workers=new Map();
        this.forkCounts = 0;
        this.listeningCounts = 0;
    }
    /**
     * 启动
     */
    run() {
        if (cluster.isMaster) {
            this[master_fun]();
        } else {
            this[worker_fun]();
        }
    }

    /**
     * fork一个新的进程
     * @param {boolean} isReaload 是否重启操作 
     */
    fork(isReaload) {
        if (cluster.isMaster) {
            let worker = cluster.fork();
            this[worker_bind_fun](worker);
            this.forkCounts++;
            if (isReaload) {
                this.emit('workerRealoadSuccess', worker)
            }
            this.workers.set(worker.id,worker);
            return worker;
        } else {
            process.send({ signal: WORKER_FORK_SIGNAL })
        }

    }
    /**
     * 关闭进程
     * @param {object} worker 子进程的实例 或 undefined
     */
    close(worker) {
        if (worker) {
            worker = this[get_worker_fun](worker);
            worker.process.kill('SIGINT');
        } else {
            process.kill('SIGINT');
        }
        this.workers.delete(worker.id);
        this.emit('workerClose', worker);
    }
    /**
     * 重启子进程
     * @param {mixed} workerId 
     */
    reload(workerId) {
        if (cluster.isMaster) {
            let workers = [];
            if (workerId) {
                if (Array.isArray(workerId)||workerId instanceof Map) {
                    workers = workerId;
                } else {
                    workers = this[get_worker_fun](workerId);
                    if (workers === workerId) {
                        return;
                    }
                    workers = [workers];
                }
            } else {
                workers = this.workers;
            }
            workers.forEach(worker=>{
                console.log(worker)
                worker=this.updateWorker(worker,'workerReload',true);
                this.emit('reload', worker);
                console.log('reload:port:',worker.port)
                this.close(worker);
            })
            
        } else {
            process.send({ signal: WORKER_RELOAD_SIGNAL, workerId })
        }
    }
    updateWorker(worker,name,value){
        let workerId=worker.id,
            _worker=this.workers.get(workerId);
        if(_worker){
            _worker[name]=value;
            this.workers.set(workerId,_worker);
            return _worker;
        }
        return worker;
    }
    /**
     * 通过子进程ID获取子进程实例
     * @param {string} worker 
     */
    [get_worker_fun](worker) {
        if (worker && cluster.isMaster && typeof worker !== 'object') {
            if (typeof worker !== 'number') {
                worker = parseInt(worker);
            }
            worker = this.workers.get(worker);
        }
        return worker;
    }

    /**
     * 主进程开始
     */
    [master_fun]() {
        this[init_fun]();
        this.emit('masterStart');
    }

    /**
     * 子进程开始
     */
    [worker_fun]() {
        this[init_fun]();
        this.emit('workerStart', cluster.worker)
    }

    /**
     * 进程初始化
     */
    [init_fun]() {
        process.on('uncaughtException', (err) => {
            this.emit('error', err, cluster.isMaster ? undefined : cluster.worker)
            console.log(err)
        });
    }

    /**
     * 初始化绑定子进程事件
     * @param {object} worker 子进程实例
     */
    [worker_bind_fun](worker) {
        worker.on('message', (data) => {
            if (!data) return;
            switch (data.signal) {
                case WORKER_FORK_SIGNAL:
                    this.fork();
                    break;
                case WORKER_RELOAD_SIGNAL:
                    this.fork();
                    break;

                default:
                    this.emit('message', data, worker);
                    break;
            }
        });
        worker.on('listening', (address) => {
            this.listeningCounts++;
            worker=this.updateWorker(worker,'port',address.port);
            this.emit('workerListening', address, worker)
        });
        worker.on('error', (err) => {
            this.emit('error', err, worker)
            this.reload([worker]);
        });
        worker.on('exit', (message) => {
            if (worker.workerReload) {
                this.fork(true);
            }
        });
    }
}
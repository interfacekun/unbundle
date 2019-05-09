var fpath = require("path");
var ffs = require("fire-fs");
var process = require('child_process');
var workDir = require('./walk-dir')



var utils = {};

utils.runExec = (cmdStr, cmdPath, cb) => {
    // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
    let workerProcess = process.exec(cmdStr, {
        cwd: cmdPath
    })
    // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})

    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on('data', function (data) {
        Editor.log(`[info ${moment().format('h:mm:ss.S')}] ` + data);
    });

    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
        Editor.log(`[error ${moment().format('h:mm:ss.S')}] ` + data);
    });

    // 退出之后的输出
    workerProcess.on('close', function (code) {
        Editor.log(`[exit ${moment().format('h:mm:ss.S')}]` + code);
        cb(code);
    })
}

utils.copyFile = (src, dist) => {
    ffs.createReadStream(src).pipe(ffs.createWriteStream(dist));
}


/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 * @param filters {String} 过滤的文件后缀名
 */
var totalFiles = 0;
var nowFiles = 0;
utils.copyDir = (src, dist, filters, callback) => {
    if (!totalFiles || totalFiles === 0) {
        nowFiles = 0;
        totalFiles = workDir.getTotalFiles(src);
        Editor.warn(`cp ${src} to ${dist}`);
        Editor.warn(`total files ${totalFiles}`);
    }

    function _copy(err, src, dist) {
        if (err) {
            nowFiles = 0;
            totalFiles = 0;
            callback(err);
        } else {
            ffs.readdir(src, function (err, paths) {
                if (err) {
                    nowFiles = 0;
                    totalFiles = 0;
                    callback(err)
                } else {
                    paths.forEach(function (path) {
                        var _src = fpath.join(src, path);
                        var _dist =  fpath.join(dist, path);
                        ffs.stat(_src, function (err, stat) {
                            if (err) {
                                nowFiles = 0;
                                totalFiles = 0;
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if (stat.isFile()) {
                                    let extname = fpath.extname(_src);
                                    
                                    if (filters.indexOf(extname) == -1) {
                                        utils.copyFile(_src, _dist);
                                    } else {
                                        Editor.log("filter", _src, extname);
                                    }

                                    // ffs.writeFileSync(_dist, ffs.readFileSync(_src));
                                    nowFiles += 1;
                                    if (nowFiles === totalFiles) {
                                        Editor.log(`${nowFiles}/${totalFiles}`, typeof(callback));
                                        nowFiles = 0;
                                        totalFiles = 0;
                                        callback(null, nowFiles, totalFiles);
                                    }
                                } else if (stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    utils.copyDir(_src, _dist, filters, callback)
                                }
                            }
                        })
                    })
                }
            })
        }
    }

    ffs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            ffs.mkdirSync(dist);
        }
        _copy(null, src, dist);
    });
}

utils.runExecSync = (cmdStr, cmdPath) => {
    return process.execSync(cmdStr, {
        cwd: cmdPath
    })
}

utils.copyDirPromise = (src, dist, filters) => {

    return new Promise((resolve) => {
        if (!ffs.existsSync(src)) {
            resolve({error: null});
            return;
        };
        utils.copyDir(src, dist, filters, (error, nowFiles, totalFiles) => {
            if (error) {
                resolve({error})
            } else {
                resolve({error, nowFiles, totalFiles});
            }
        });
    })
}

module.exports = utils


// 部分加密代码
// c = require("xxtea-node")
// d = require("zlib")
// encryptJsFiles: function (e, n) {
//     M(e, o => {
//         if (o) return n && n(o), void 0;
//         if (!r.existsSync(v)) return n && n(new Error(`Can't find ${v}, please first build project`)), void 0;
//         if (!e.xxteaKey) return n && n(new Error("xxtea key is empty.")), void 0;
//         (function (e) {
//             let i = t.join(v, "frameworks/runtime-src/Classes/AppDelegate.cpp");
//             if (!r.existsSync(i)) return Editor.warn(`Can't find path [${i}]`), void 0;
//             let n = r.readFileSync(i, "utf8").split("\n");
//             for (let t = 0; t < n.length; t++) - 1 !== n[t].indexOf("jsb_set_xxtea_key") && (n[t] = `    jsb_set_xxtea_key("${e.xxteaKey}");`);
//             r.writeFileSync(i, n.join("\n"))
//         })(e);
//         let a = t.join(v, "src", "**/*.js");
//         l(a, (o, a) => {
//             if (o) return n && n(o), void 0;
//             a.forEach(n => {
//                 n = t.normalize(n);
//                 try {
//                     let o = r.readFileSync(n, "utf8");
//                     e.zipCompressJs ? (o = d.gzipSync(o), o = c.encrypt(o, c.toBytes(e.xxteaKey))) : o = c.encrypt(c.toBytes(o), c.toBytes(e.xxteaKey)), r.writeFileSync(t.join(t.dirname(n), t.basenameNoExt(n)) + ".jsc", o), i.sync(n, {
//                         force: !0
//                     })
//                 } catch (e) {
//                     Editor.warn(e)
//                 }
//             }), n && n()
//         })
//     })
// }


## native不合并脚本插件
native项目如果改了脚本，每次都需要build一次脚本，比较耗时。而且热更的时候要更新全部代码，老板很生气(我论坛上看到不少人在抱怨)。
## 使用方法
> 1 把插件放到工程的packages文件夹下  
> 2 第一次需要通过ccc build生成原生工程项目，即build/jsb-link或build/jsb-default，如果已经build过了，忽略这一步  
> 3 修改脚本后，不用ccc build脚本了，直接在编辑器上点击该插件，根据自己的项目选择jsb-link或者jsb-default  
> 4 xcode/android studio/ccc compile 你的native工程  

## 注意事项
> 1 合并的脚本理论上加载速度要更快。除非你觉得不合并十分重要或者是改一行代码就要build一次脚本十分痛苦，不然最好只用在测试阶段，正式上线还是合并脚本比较好。  
> 2 如果你改动了资源，还是需要ccc build。因为要生成setting.js，目前还没有空去研究直接调用编辑器生成，我只知道有个buildSettings的task。  
> 3 你应该看得出来，这不是什么高深的东西，有何高见，可以交流，但不要喷人，求同存异。  
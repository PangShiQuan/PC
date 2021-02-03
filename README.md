[综合平台服务](http://dsf-develop.web.com)，目前版本 [v2.7.0](https://jira.mtkefu.com/issues/?jql=labels%20%3D%20PC-dsf-v2.7.0)

### 管理

---

工具

- 依赖库管理 - [yarn](https://yarnpkg.com/en/docs/install) **注:因为需要支持 workspace 功能, 请安装 yarn v1.0.0 或以上的版本**

  * 下载依赖库：`yarn`，运行：`yarn start`，打包：`yarn run build`
  * 依赖库 `package.json` 置放
    * modules 各自模块
    * 主干路径

- JS 执行引擎 - [Node.js](https://nodejs.org/en/download/) v10 (v10.8.0 或以上)

### APP 版本发布命名

- 从 `v1.1.0` 版本格式应用 [Semantic Versioning](http://semver.org/)。

### 文档归类

* bin - 操作系统的打包用脚本
* client - 默认及业主个别代码/样式/设定/资源
* helper - 开发共用库
* modules - 开发平台的独立模块
* polyfill - 代码兼容后备
* public - 打包捆绑资源
* scripts - 提交代码期间执行命令

### 综合平台

---

以 client/default 为默认基础, 业主以各自clientID文件夹来扩展:

1.  933彩票，clientID：`17`, `CLIENT=933v2`
2.  1233彩票，clientID：`660`, `CLIENT=1233`
3.  666彩票，clientID：`143`, `CLIENT=666`
4.  千亿彩票，clientID：`1040`, `CLIENT=1000`
5.  955彩票，clientID：`1`, `CLIENT=955`
6.  555彩票，clientID：`1099`, `CLIENT=555`

### 发布工序

---

- [ ] 在每一个 sprint/版本开始时新建一个 release `git flow release start {版本号}`
- [ ] 从开发分支(dsf-develop)开始一个新的功能分支 `git flow feature start {功能号/JIRA号}`
- [ ] 完成了要发布的功能，做个[merge request](https://gitlab.mtgogo.online/vincylouis/jx-lottery-webapp/merge_requests/new)进去当期的 release,
- [ ] 做有必要的改动和修复后，关闭发布分支进主分支(dsf-master) `git flow release finish {版本号}`
- [ ] 切换厅主分支，确保版本和主分支是同步的 `git pull origin dsf-master`
- [ ] 确保 [`./src/utils/API.js`](https://gitlab.mtgogo.online/vincylouis/jx-lottery-webapp/blob/dsf-master/src/utils/API.js) 文件里的厅主 ID `${CLIENT_ID}` 是正确的
- [ ] 解决必要的分歧，然后更新厅主分支去线上仓库 `git push`
- [ ] 关闭已发布的功能分支 `git flow feature finish {功能号/JIRA号}`

---

SIT/UAT/PROD发布流程
- Jenkins SIT和UAT发布域名：http://192.168.9.25:9000/view/SIT%20Deploy%20Frontend/job/h5-pc-commonality-dynamic-sit/
- UAT域名：彩票版本= www.513xyz.com 综合平台版本= dsf.513xyz.com
- SIT域名：彩票版本= develop.web.com 综合平台版本= dsf-develop.web.com 其他的sit-dynamic1.web.com到sit-dynamic7.web.com都可以任用
- SIT打包了不需要通知运维，UAT则需要通知运维发布。
- Jenkins 线上发布域名：http://192.168.9.25:9000/view/SIT%20Deploy%20Frontend/job/h5-pc-commonality-dsf-prod/
- 发布前代码必须推上主分支dsf-master，打包了后必须通知运维发布。

---

启动本地服务
- 启动default文件夹= yarn start
- 启动其他业主的文件夹= npx cross-env CLIENT={文件夹名字} yarn start
- 每个业主（彩票和综合平台）都有单独自己的文件夹，文件夹里都是不共用资源，而src和plugin文件夹里是共用资源。


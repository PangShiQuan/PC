## 业主创建工序

`*` 为必须执行项

### （一）`*`创建一个独特名称的目录

目录名称必须应承相对 [jenkins](http://192.168.1.25:9000/job/web-dsf-dev/build?delay=0sec) `CLIENT` 变量的格式，如：

- `CLIENT` 选项是 `933` 目录的名称将会是 `933`。
- `CLIENT` 选项若是 `933-demo` 目录名称将会是 `933-demo`

### （二）`*`创建相应 `./${CLIENT}/config.js`

用途: 给予src文件夹代码引用所选择的CLIENT其对应的特定函数.

文件文件主要输出厅主的独特 `CLIENT_ID`，`CLIENT_ID` 的选择将被 `process.NODE_ENV.PROD (true|false)` 所影响。

- 当为 `true` 时将用 `./${CLIENT}/config.js` 所输出的 `CLIENT_ID`,
- 当为 `false` 时将用 `./default/config.js` 所输出的 `CLIENT_ID`。

*使用 `setup.js` 来设定所需函数的判定逻辑*

### （三）`*`添加样式变量 `./${CLIENT}/index.less`

每个厅主的样式变量值，存在性都**必须**同步。

变量名称以[BEM](http://www.ayqy.net/blog/bem-block-element-modifier/)方式取名，分裂出来的备用值以 `--` 隔开。

颜色值正常情况都建议能分裂成亮值 `--light` 或暗值 `--dark`以做备用， 由设计师提供。

如果非必要情况下设计师不给予颜色值，请使用[网上生成器](https://material.io/tools/color/)生成。

### （四）添加相应的 `favicon.ico`

### （五）添加所需要覆盖默认的组件、样式和静态资源。

组件、样式或静态文件的选择将以各自厅主所[生成的目录 `./${CLIENT}/`](#%EF%BC%88%E4%B8%80%EF%BC%89%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E7%8B%AC%E7%89%B9%E7%9A%84%E7%9B%AE%E5%BD%95) 里的 `components`、`assets`、`styles` 为优先，当获取不到时将以默认目录 `./default-m` 里的组件、样式或静态文件渲染。

#### 路由的掌控

 组件 `components` 和样式 `styles` 主要以打包器[`webpack.resolve.alias`](https://webpack.js.org/configuration/resolve/#resolve-alias) 去解析，可省略 `../../../` 等的搜索。

可是样式里的静态文件输入如 `background：url(...);` 无法解析，所以务必清楚所输入的静态文件位置。

#### 执行 scripts
执行工具 [npx](https://www.npmjs.com/package/npx)

列子: `npx CLIENT=933 yarn start:app`

有待优化, 直接传入相对 CLIENT 给执行命令即可.
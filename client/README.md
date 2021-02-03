### 添加样式
***
```js
添加样式在其中一个业主
1）打开一个业主的文件夹 比如：client > 955。
2）寻找index.less文件 加入要新加的文件样式的名字 比如：@import (optional) './variable/header2.less;'。
3）在文件夹 client > 955 > variable 加入 header2.less 文件。
4）用 '@' 的写法引入样式 比如在 header2.less 文件里引入的样式名字 都要在 client > default的文件夹里添加一遍，不然会报错。如果业主本身的文件夹没添入可是default文件夹有，就会自动采用default的样式。无需自行添加。
5）把业主个别的颜色添加在base.less 文件里。
6）需要在 src > styles > 任何样式文件夹加入在每个业主或是default里加入相同的 '@'变量名称，才能导入每个业主的样式。另外还需引入 '@import '~clientResolver/index.less';' 来进行业主各自和default文件夹里样式的调动。
-
```
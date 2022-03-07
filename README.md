# virtual-scroll-table

## 用法
参照 src\examples\App.vue
引入 import viewTable from 'virtual-scroll-table/scr/viewTable'

## 选项 options
leftFixedNum 左侧固定列数 默认0
rightFixedNum 右侧固定列数 默认0

### 已实现的功能
大数据虚拟滚动
两端固定列
自定义模板渲染,比如操作列,采用jsx语法
细粒度的自定义列宽
### 待开发的功能
导出表格
首列复选框

### 每行高度不统一虚拟滚动
src\components\virtualScrollTable\virtualScrollTableDynamic.vue
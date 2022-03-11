<template>
  <div class="vt-view-table-wrap">
    <div
      ref="leftScrollWrap"
      class="vt-fixed vt-left-fixed"
      :style="{ width: options.leftFixedNum * options.colWidth + 'px' }"
      @scroll="handleScroll"
    >
      <tableHeader
        :cols="leftFixedCols"
        :levelsArr="leftLevelsArr"
        :colWidth="mOptions.colWidth"
      ></tableHeader>
      <div :style="{ height: shouldDatasHeight + 'px' }">
        <tableBody
          :cols="leftFixedCols"
          :datas="renderDatas"
          :style="{ top: tableTop }"
          :colWidth="mOptions.colWidth"
          @clickExtend="handleClickExtend"
        ></tableBody>
      </div>
    </div>
    <div ref="centerScrollWrap" class="vt-view-table" @scroll="handleScroll">
      <div class="vt-header">
        <div>
          <table class="vt-header-table">
            <colgroup>
              <col
                v-for="(item, i) of colLeafs"
                :key="i"
                :style="{width: item.width || '100px'}"
              />
            </colgroup>
            <tr v-for="(item, i) of centerLevelsArr" :key="i">
              <th
                v-for="(col, i1) of item"
                :key="i1"
                :colspan="col.leafNum"
                :rowspan="col.isLeaf && colsDeep - col.level + 1"
              >
                {{ col.label }}
              </th>
            </tr>
          </table>
        </div>
      </div>
      <div :style="{ height: shouldDatasHeight + 'px' }">
        <tableBody
          :cols="cols"
          :datas="renderDatas"
          :style="{ top: tableTop }"
          :colWidth="mOptions.colWidth"
          @clickExtend="handleClickExtend"
        ></tableBody>
      </div>
      <!-- <div class="vt-scroll-horizontal">
        <div class="vt-scroll-horizontal-bar" @mousedown="handle"></div>
      </div> -->
    </div>
    <div
      ref="rightScrollWrap"
      class="vt-fixed vt-right-fixed"
      :style="{ width: options.rightFixedNum * options.colWidth + 'px' }"
      @scroll="handleScroll"
    > 
      <tableHeader
        :cols="rightFixedCols"
        :levelsArr="rightLevelsArr"
        :colWidth="mOptions.colWidth"
      ></tableHeader>
      <div :style="{ height: shouldDatasHeight + 'px' }">
        <tableBody
          :cols="rightFixedCols"
          :datas="renderDatas"
          :style="{ top: tableTop }"
          :colWidth="mOptions.colWidth"
        ></tableBody>
      </div>
    </div>
  </div>
</template>

<script>
import utils from "zh-utils1";
import _ from "lodash";
import $ from "jquery";
import "jquery.nicescroll";
import tableHeader from "./table-header";
import tableBody from "./table-body";
import { leafExtract } from './utils'

// 单纯的计算指定属性的叶子节点数
function calcLeafNum(cols, prop = "childs") {
  let colsLeafNum = 0;
  cols.forEach((col) => {
    if (col[prop] && col[prop].length) {
      const leafNum = calcLeafNum(col[prop], prop);
      colsLeafNum += leafNum;
    } else {
      colsLeafNum++;
    }
  });
  return colsLeafNum;
}
function calcLeaf(cols, level) {
  let colsLeafNum = 0;
  cols.forEach((col) => {
    col.level = level;
    if (col.childs && col.childs.length) {
      col.isLeaf = false;
      col.leafNum = calcLeaf(col.childs, level + 1);
      colsLeafNum += col.leafNum;
    } else {
      col.isLeaf = true;
      col.leafNum = 1;
      colsLeafNum++;
    }
  });
  return colsLeafNum;
}
const defaultOptions = {
  trHeight: 25,
  colWidth: 100,
  leftFixedNum: 0,  // 左侧固定列数
};
export default {
  setup(props) {
  },
  props: {
    cols: Array,
    rows: Array,
    options: {
      type: Object,
      default() {
        return {
          // leftFixedNum: 1,
          rightFixedNum: 1,
        };
      },
    },
    // 预估行高
    predictRowHeight: {
      type: Number,
      default: 20,
    },
  },
  data() {
    return {
      colsDeep: utils.objArrDeep(this.cols),
      shouldDatasHeight: 0, // 应该展示的全数据高度 会动态调整
      centerLevelsArr: [], // 中间级化数组
      leftFixedCols: [], // 左侧固定列
      rightFixedCols: [], // 右侧固定列
      leftLevelsArr: [], // 左侧头级化
      rightLevelsArr: [], // 右侧头级化
      renderDatas: [], // 需要渲染的数据
      tableTop: 0, // 用于可视化的表格上方偏移 同时用于整合三块滚动
      mOptions: Object.assign({}, defaultOptions, this.options), // 最终的选项
      centerCols: [], // 中间列们
      watchColsDtas: 0,  // 用于监听多个源cols datas
      datas: [],  // 用作展示的全数据
      rowHeights: [],   // 存储每行高度
      startIndex: 0,    // 渲染数据第一个索引
      predictRenderCount: 0,  // 根据容器高预估高得到预估渲染数  首次渲染后的初始化中计算
    };
  },
  computed: {
    colLeafs() {
      return leafExtract(this.cols)
    }
  },
  watch: {
    cols: {
      // immediate: true,
      handler() {
        this.watchColsDtas++
      },
    },
    rows: {
      // immediate: true,
      handler() {
        this.watchColsDtas++
      },
    },
    watchColsDtas: {
      immediate: true,
      handler() {
        this.addAction()
      },
    },
  },
  components: {
    tableHeader,
    tableBody,
  },
  created() {
    // calcLeaf(this.cols, 1);
    // this.refresh()
  },
  mounted() {
    this.genRenderDatas(0);
    $(this.$refs.centerScrollWrap).niceScroll();
  },
  methods: {
    handleClickExtend(row) {
      row.isExtend = !row.isExtend
      this.extendRefresh()
    },
    // 扩展与否变更的刷新
    extendRefresh() {
      this.datas = this.genShouldShowDatas(this.rows)
      // 是否首次
      const centerScrollWrap = this.$refs.centerScrollWrap
      // 全高度计算
      this.shouldDatasHeight = this.datas.length * 25,
      this.genRenderDatas(centerScrollWrap.scrollTop)
      this.$nextTick(() => {$(this.$refs.centerScrollWrap).getNiceScroll().resize()})
    },
    refresh() {

      this.datas = this.genShouldShowDatas(this.rows)
      this.leftFixedCols = this.cols.slice(0, this.mOptions.leftFixedNum);
      this.rightFixedCols = this.mOptions.rightFixedNum && this.cols.slice(-this.mOptions.rightFixedNum) || [];
      this.centerCols = this.cols.slice(
        this.mOptions.leftFixedNum,
        this.options.rightFixedNum ? -this.options.rightFixedNum : undefined
      );
      this.centerLevelsArr = utils.objArrLevels(this.cols);
      _.times(this.colsDeep - this.centerLevelsArr.length, () =>
        this.centerLevelsArr.push([])
      );
      this.leftLevelsArr = utils.objArrLevels(this.leftFixedCols);
      _.times(this.colsDeep - this.leftLevelsArr.length, () =>
        this.leftLevelsArr.push([])
      );
      this.rightLevelsArr = utils.objArrLevels(this.rightFixedCols);
      _.times(this.colsDeep - this.rightLevelsArr.length, () =>
        this.rightLevelsArr.push([])
      );
      // 是否首次
      const centerScrollWrap = this.$refs.centerScrollWrap
      if (centerScrollWrap) {
        (centerScrollWrap.scrollTop === 0) ? this.genRenderDatas(0) : centerScrollWrap.scrollTo({top:0,})
      }
      // 全高度计算
      this.shouldDatasHeight = this.datas.length * this.predictRowHeight,
      this.rowHeights = this.datas.map((ele, i) => {
        return {
          height: this.predictRowHeight,
          top: i * this.predictRowHeight
        }
      })
      this.$nextTick(() => {$(this.$refs.centerScrollWrap).getNiceScroll().resize()})
    },
    debounceAddAction: _.debounce(function () {
      this.addAction();
    }, 10),
    addAction() {
      // 存储列深度
      this.colsDeep = utils.objArrDeep(this.cols);
      // 对列添加一些行为属性
      this.perfectCols(this.cols, 1);
      // 考虑树形 应该展示的全数据
      this.refresh()
    },
    genShouldShowDatas(datas) {
      let shouldShowDatas = []
      datas.forEach(data => {
        shouldShowDatas.push(data)
        if (data.childs && data.childs.length && data.isExtend) {
          shouldShowDatas = shouldShowDatas.concat(this.genShouldShowDatas(data.childs))
        }
      })
      return shouldShowDatas
    },
    perfectCols(cols, level) {
      let colsLeafNum = 0;
      cols.forEach((col) => {
        col.level = level;
        if (col.childs && col.childs.length) {
          col.isLeaf = false;
          col.leafNum = this.perfectCols(col.childs, level + 1);
          colsLeafNum += col.leafNum;
        } else {
          col.isLeaf = true;
          col.leafNum = 1;
          colsLeafNum++;
          col.rowspan = this.colsDeep - level + 1;
        }
      });
      return colsLeafNum;
    },
    calcLeaf(cols) {
      return cols.reduce((acc, col) => (acc += col.leafNum), 0);
    },
    genRenderDatas(scrollTop) {
      const trHeight = this.mOptions.trHeight;
      const renderNum =
        Math.ceil(this.$el.clientHeight / this.mOptions.trHeight) + 2;
      const noRenderNumTop = Math.floor(scrollTop / this.mOptions.trHeight); // 上方不渲染数
      this.renderDatas = this.datas.slice(
        noRenderNumTop,
        noRenderNumTop + renderNum
      );
      this.tableTop = noRenderNumTop * trHeight + "px";
    },
    handleScroll: _.throttle(function (e) {
      const scrollTop = e.target.scrollTop;
      // 联动触发的滚动就不需要再处理了
      if (this.tableTop === scrollTop) return
      this.tableTop = scrollTop
      this.genRenderDatas(e.target.scrollTop);
      this.$refs.leftScrollWrap.scrollTo({ top: scrollTop });
      this.$refs.rightScrollWrap.scrollTo({ top: scrollTop });
      this.$refs.centerScrollWrap.scrollTo({ top: scrollTop });
    }, 20),
  },
  updated() {

  },
};
</script>

<style>
.vt-view-table-wrap {
  display: flex;
  height: 100%;
  position: relative;
}
.vt-view-table-wrap table {
  border-spacing: 0;
  width: max-content;
  position: relative;
}
.vt-view-table-wrap tr {
  height: 25px;
  background-color: #fff;
}
.vt-view-table-wrap th {
  border: 1px solid #00f;
}
.vt-view-table-wrap td {
  border: 1px solid #00f;
}
.vt-fixed {
  position: absolute;
}
.vt-header-table {
  table-layout: fixed;
}
.vt-left-fixed {
  flex-shrink: 0;
  overflow: auto;
  height: 100%;
  z-index: 2;
}
.vt-left-fixed::-webkit-scrollbar {
  display: none;
}
.vt-left-body-table {
  position: relative;
}
.vt-right-fixed {
  overflow-x: hidden;
  flex-shrink: 0;
  height: 100%;
  right: 0;
}
.vt-right-fixed::-webkit-scrollbar {
  display: none;
}
.vt-view-table {
  /* display: flex;
  flex-direction: column; */
  /* border: 1px solid #888; */
  overflow: auto;
  box-sizing: border-box;
  flex-grow: 1;
  position: relative;
}
.vt-view-table::-webkit-scrollbar {
  display: none;
}
.vt-header {
  z-index: 1;
  position: sticky;
  top: 0;
}
.vt-header.vt-header-table {
  z-index: 1;
  position: sticky;
  top: 0;
}
.vt-td {
  padding: 0;
  overflow: hidden;
}
.vt-td-div {
  height: 23px;
  width: v-bind(mOptions.colWidth - 2 + 'px');
}
.vt-scroll-horizontal {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 7px;
}
.vt-scroll-horizontal-bar {
  position: absolute;
  width: 30px;
  height: 100%;
  background-color: rgba(100, 100, 100, 0.5);
}
.nicescroll-cursors {
  z-index: 2;
}
</style>
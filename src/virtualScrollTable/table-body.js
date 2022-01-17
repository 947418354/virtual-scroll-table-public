import { h } from 'vue'

/**
 * 叶子提取
 */
function leafExtract(arr, prop = "childs") {
  let nArr = []
  arr.forEach(ele => {
    if (ele.isLeaf) {
      nArr.push(ele)
    } else {
      nArr = nArr.concat(leafExtract(ele[prop]))
    }
  })
  return nArr
}
export default {
  render() {
    return (
      <table class="vt-right-body-table">
        <colgroup>
          {
            this.leafCols.map(col => (<col style={'width:' + this.colWidth + 'px'}></col>))
          }
        </colgroup>
        <tbody class="vt-right-body-tbody">
          {this.datas && this.datas.map(row => (<tr>
            {
              this.leafCols.map((col, i) => (<td class="vt-td">
                <div class="vt-td-div">
                  {/* 扩展符 */}
                  <span v-show={i === 0 && row.childs && row.childs.length} onClick={() => {this.handleClickExtend(row)}}>{row.isExtend ? '-' : '+'}</span>
                  {col.cellRender && col.cellRender(row) || col.formatter && col.formatter(row[col.prop]) || row[col.prop]}</div></td>))
            }
          </tr>))}
        </tbody>
      </table>
    )
  },
  props: {
    cols: {},
    datas: {},
    colWidth: {},
  },
  data() {
    return {
      leafCols: leafExtract(this.cols),
    }
  },
  watch: {
    cols(n) {
      this.leafCols = leafExtract(n)
    },
    datas(n) {
    }
  },
  methods: {
    handleClickExtend(row) {
      this.$emit('clickExtend', row)
    }
  },
}
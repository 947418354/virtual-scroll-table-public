import _ from 'lodash'
import ViewTable from '../index'

const vtContainer = document.getElementById('vtContainer')
const colNum = 20
let cols = _.times(colNum, time => ({
  label: `列名${time}`,
  prop: `prop${time}`,
  formatter: (cellValue) => cellValue + '<span style="color:#f00;">ff</span>',
}))
// 在1号位插入一个多级列
cols.splice(1, 0, {
  label: '多级1',
  childs: [
    {
      label: `c1`,
      prop: `c1`,
    },
    {
      label: `c2`,
      prop: `c2`,
    }
  ]
})
// 操作列
cols.push({
  label: '操作',
  formatter: () => {
    return `
      <div>
        <button>查看</button>
      </div>
    `
  }
})
let datas = _.times(10000, time => {
  let obj = {}
  _.times(colNum, time => obj['prop' + time] = `属性${time}值`)
  obj.c1 = 'c1值'
  obj.c2 = 'c2值'
  return obj
})
new ViewTable(vtContainer, cols, datas)
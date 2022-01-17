import _ from 'lodash'
import utils from 'zh-utils1'

/* function addLeaf(col) {
  col.leafNum = 0
  if (col.childs && col.childs.length) {
    col.isLeaf = false
    col.childs.forEach(col1 => {
      col.leafNum += addLeaf(col1)
    })
  } else {
    col.isLeaf = true
    col.leafNum = 1
  }
  return col.leafNum
} */
function calcLeaf(cols, level) {
  let colsLeafNum = 0
  cols.forEach(col => {
    col.level = level
    if (col.childs && col.childs.length) {
      col.isLeaf = false
      col.leafNum = calcLeaf(col.childs, level + 1)
      colsLeafNum += col.leafNum
    } else {
      col.isLeaf = true
      col.leafNum = 1
      colsLeafNum++
    }
  })
  return colsLeafNum
}

class ViewTable {
  constructor(container, cols, datas, opt) {
    this.container = container
    this.cols = cols
    this.colsDeep = utils.objArrDeep(cols)
    this.datas = datas
    this.cellHeight = 20
    this.leftFixed = opt && opt.leftFixed || 1
    this.leftFixedCols = this.cols.slice(0, this.leftFixed)
    this.rightFixedNum = opt && opt.rightFixedNum || 1
    this.rightFixedCols = this.cols.slice(-this.rightFixedNum)
    this.scrollCols = this.cols.slice(this.leftFixed)
    this.colWidth = 100
    this.addActionCols()
    this.init()
  }
  addActionCols() {
    const cols = this.cols
    calcLeaf(cols, 1)

  }
  init() {
    const datasHeight = (this.datas.length * this.cellHeight) + 'px'
    this.outContainer = this.createTemplate()
    // this.leftFixedDiv = $(`<div class="vt-left-fixed" style="width:${this.leftFixed * this.colWidth}px; height:${this.container.clientHeight}px;"></div>`)[0]
    this.leftFixedDiv = $('.vt-left-fixed', this.outContainer)[0]
    this.vTContainer = $('.vt-view-table', this.outContainer)[0]
    this.leftHeaderDiv = this.createHeaderDiv(this.leftFixedCols)
    this.leftBodyDiv = $(`<div style="height:${datasHeight}"/>`)[0]
    this.leftBodyTable = $('<table class="vt-left-body-table"/>')[0]
    this.leftTableTBody = $('<tbody/>')[0]
    this.leftBodyTable.append(this.createBodyColgroup())
    $(this.leftTableTBody).appendTo(this.leftBodyTable)
    this.leftBodyDiv.append(this.leftBodyTable)
    this.leftFixedDiv.append(this.leftHeaderDiv, this.leftBodyDiv)
    const headerTrs = this.renderTableHeader()
    this.vTContainer.style.height = this.container.clientHeight + 'px'
    let viewTableC = `
      <div class="vt-header">
        <div></div>
        <div>
          <table class="vt-header-table">
            <colgroup>
              ${_.map(this.scrollCols, col => `<col style="width:100px;"></col>`).join('')}
            </colgroup>
            ${headerTrs}
          </table>
        </div>
      </div>
    `
    const vTBody = document.createElement('div')
    vTBody.classList.add('vt-body-scroll')
    vTBody.style.height = (this.datas.length * this.cellHeight) + 'px'
    const yinshiban = document.createElement('div')
    // yinshiban.style.height = (this.datas.length * this.cellHeight) + 'px'
    this.contentTable = $('<table/>')[0]
    this.contentTable.append(this.createBodyColgroup())
    this.contentTable.style.position = 'relative'
    this.contentTableTBody = $('<tbody/>')[0]
    this.contentTable.append(this.contentTableTBody)
    yinshiban.appendChild(this.contentTable)
    // 事件绑定
    this.handleScrollLeft = this.handleScrollLeft.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
    // vTBody.addEventListener('scroll', this.handleScroll)
    vTBody.appendChild(yinshiban)

    this.vTContainer.innerHTML = viewTableC
    this.vTContainer.appendChild(vTBody)
    this.vTBody = vTBody
    console.log(this.outContainer)
    // this.outContainer.append(this.leftFixedDiv, this.vTContainer)
    this.container.appendChild(this.outContainer)
    $('.vt-left-fixed', this.outContainer)[0].addEventListener('scroll', this.handleScrollLeft)
    this.vTContainer.addEventListener('scroll', this.handleScroll)
    this.handleScroll()
  }
  createTemplate() {
    const datasHeight = (this.datas.length * this.cellHeight) + 'px'
    const clientHeight = this.container.clientHeight
    return $(`<div class="vt-view-table-wrap">
      <div class="vt-left-fixed" style="width:${this.leftFixed * this.colWidth}px; height:${clientHeight}px;"></div>
      <div class="vt-view-table"></div>
      <div class="vt-right-fixed" style="width:${this.rightFixedNum * this.colWidth}px; height:${clientHeight}px;">
        ${this.createHeaderDivHtml(this.rightFixedCols)}
        <div style="height:${datasHeight}">
          <table class="vt-right-body-table">
            <colgroup>
              ${_.times(this.rightFixedNum, col => `<col style="width:100px;"></col>`).join('')}
            </colgroup>
            <tbody class="vt-right-body-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>`)[0]
  }
  createHeaderDivHtml(cols) {
    const leafNum = calcLeaf(cols, 1)
    const levelsArr = utils.objArrLevels(cols)
    _.times(this.colsDeep - levelsArr.length, () => levelsArr.push([]))
    return `<div class="vt-header">
      <div></div>
      <div>
        <table class="vt-header-table">
          <colgroup>
            ${_.times(leafNum, col => `<col style="width:100px;"></col>`).join('')}
          </colgroup>
          ${_.map(levelsArr, (levelCols) => `<tr>
            ${_.map(levelCols, col => `<th colspan="${col.leafNum}" rowspan="${col.isLeaf && (this.colsDeep - col.level + 1)}">${col.label}</th>`).join('')}
          </tr>`).join('')}
        </table>
      </div>
    </div>`
  }
  createHeaderDiv(cols) {
    const leafNum = calcLeaf(cols, 1)
    const levelsArr = utils.objArrLevels(cols)
    _.times(this.colsDeep - levelsArr.length, () => levelsArr.push([]))
    return $(`<div class="vt-header">
      <div></div>
      <div>
        <table class="vt-header-table">
          <colgroup>
            ${_.times(leafNum, col => `<col style="width:100px;"></col>`).join('')}
          </colgroup>
          ${_.map(levelsArr, (levelCols) => `<tr>
            ${_.map(levelCols, col => `<th colspan="${col.leafNum}" rowspan="${col.isLeaf && (this.colsDeep - col.level + 1)}">${col.label}</th>`).join('')}
          </tr>`).join('')}
        </table>
      </div>
    </div>`)[0]
  }
  createBodyColgroup() {
    return $(`<colgroup>
      ${_.map(this.scrollCols, col => `<col style="width:100px;"></col>`).join('')}
    </colgroup>`)[0]
  }
  renderTableHeader() {
    const cols = this.scrollCols
    const deep = utils.objArrDeep(cols)
    const levelsArr = utils.objArrLevels(cols)
    let trs = ''
    _.forEach(levelsArr, levelCols => {
      trs += `
        <tr>
          ${levelCols.map(col => `<th colspan="${col.leafNum}" rowspan="${col.isLeaf && (deep - col.level + 1)}">${col.label}</th>`).join('')}
        </tr>
      `
    })
    return trs
  }
  createDataTrs(cols, datas) {
    return `
      ${datas.map(record => `<tr>
        ${cols.map(col => `<td class="vt-td"><div style="height:${this.cellHeight}px;">${col.formatter ? col.formatter(record[col.prop]) : record[col.prop]}</div></td>`).join('')}
      </tr>`).join('')}
    `
  }
  renderTableBody(datas) {
    const cols = this.scrollCols
    return `
      ${datas.map(record => `<tr>
        ${cols.map(col => `<td class="vt-td"><div style="height:${this.cellHeight}px;">${col.formatter ? col.formatter(record[col.prop]) : record[col.prop]}</div></td>`).join('')}
      </tr>`).join('')}
    `
  }
}
ViewTable.prototype.handleScrollLeft = _.throttle(function (e) {
  let scrollTop = e && e.target.scrollTop || 0; // 滚去的高度
  //上方不渲染的条数
  let overTopNum = Math.floor(scrollTop / this.cellHeight)
  // 应该渲染的条数
  // let shouldRenderNum = Math.ceil(this.vTBody.clientHeight / this.cellHeight) + 2
  let shouldRenderNum = Math.ceil(this.vTContainer.clientHeight / this.cellHeight) + 2
  this.clist = this.datas.slice(overTopNum, overTopNum + shouldRenderNum);
  this.leftFixed && (this.leftTableTBody.innerHTML = this.createDataTrs(this.leftFixedCols, this.clist))
  $('.vt-left-body-table', this.outContainer)[0].style.top = (overTopNum * this.cellHeight) + 'px'
  $('.vt-view-table', this.outContainer)[0].scrollTo({ top: overTopNum * this.cellHeight, })
}, 10)
ViewTable.prototype.handleScroll = _.throttle(function (e) {
  let scrollTop = e && e.target.scrollTop || 0; // 滚去的高度
  //上方不渲染的条数
  let overTopNum = Math.floor(scrollTop / this.cellHeight)
  // 应该渲染的条数
  // let shouldRenderNum = Math.ceil(this.vTBody.clientHeight / this.cellHeight) + 2
  let shouldRenderNum = Math.ceil(this.vTContainer.clientHeight / this.cellHeight) + 2
  
  this.clist = this.datas.slice(overTopNum, overTopNum + shouldRenderNum);
  this.leftFixed && (this.leftTableTBody.innerHTML = this.createDataTrs(this.leftFixedCols, this.clist))
  console.log($('.vt-right-body-tbody', this.outContainer)[0])
  $('.vt-right-body-tbody', this.outContainer).html(this.createDataTrs(this.rightFixedCols, this.clist))
  this.contentTableTBody.innerHTML = this.renderTableBody(this.clist)
  this.contentTable.style.top = (overTopNum * this.cellHeight) + 'px'
  $('.vt-left-fixed', this.outContainer)[0].scrollTo({
    top: overTopNum * this.cellHeight,
  })
}, 10)

export default ViewTable
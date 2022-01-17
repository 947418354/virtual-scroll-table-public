/**
 * 叶子提取
 */
export function leafExtract(arr, prop = "childs") {
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
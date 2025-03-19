/**
 * 解析HTML课表并转换为结构化数据
 * @param {string} html - 包含课表信息的HTML字符串
 * @returns {Array} 返回解析后的课程信息数组，包含每节课的名称、时间、教师、教室等信息
 */
function scheduleHtmlParser(html) {
  // 使用cheerio解析HTML，内置了jQuery风格的DOM操作API
  let result = [] // 存储解析后的课程信息
  /**@type {import('cheerio').CheerioAPI} */
  let $ = cheerio.load(html, {
    decodeEntities: false // 不转换HTML实体
  })
  let config = {} // 存储配置信息
  try {
    // 从HTML中解析配置信息
    config = JSON.parse($('#ltxhhzConfig').text())
  } catch (error) {
    // 忽略配置解析错误
  }
  try {
    // 遍历tbody中的每一行
    $('tbody')
      .children()
      .each(function (i, el) {
        if (i) { // 跳过第一行表头
          const num = [] // 存储课程节次信息
          const children1 = $(el).children()
          for (let i1 = 0; i1 < children1.length; i1++) {
            // 遍历每一列
            const el1 = children1.get(i1)
            console.log(`第${i}行 第${i1}列`)
            if (i1 === 0) { // 第一列是节次信息
              let inner = $(el1).text().trim()
              if (inner.includes('备注')) {
                break // 遇到备注列则跳过
              }
              num.push(...Array.from(inner.matchAll(/\d+/g)).map(e => +e)) // 提取节次数字
            } else { // 其他列是课程信息
              // 初始化课程信息对象
              let cls = {
                name: '', // 课程名称
                day: i1, // 星期几 (1-7)
                sections: [2 * i - 1, 2 * i] // 课程节次 (如1-2节)
              }
              // 解析课程详细信息
              $('.kbcontent', el1)
                .children()
                .each(function (i2, el2) {
                  const str = $(el2).text().trim() // 获取当前元素文本
                  if (!cls.name) {
                    // 获取课程名称
                    if (/^\-+$/.test(el2.prev.data.trim())) { // 忽略分隔线
                      return
                    }
                    cls.name = el2.prev.data.trim() // 课程名称在前一个文本节点
                  } else {
                    // 解析教师、教室、周次等信息
                    // 解析教师信息
                    if (el2.attribs && el2.attribs.title && el2.attribs.title.includes('教师')) {
                      if (config.delTitle) {
                        // 根据配置删除教师职称后缀
                        cls.teacher = str.replace(config.delTitle ? /(其他|副?教授|讲师|农艺师|\(.+?\)|（.+?）)$/g : '', '').trim()
                      } else {
                        cls.teacher = str
                      }
                    } 
                    // 解析教室信息
                    else if (el2.attribs && el2.attribs.title && el2.attribs.title.includes('教室')) {
                      cls.position = str
                    } 
                    // 解析周次信息
                    else if (el2.attribs && el2.attribs.title && el2.attribs.title.includes('周次')) {
                      cls.weeks = [] // 初始化周次数组
                      const weekStr = str.match(/([\d-,]+)\(?(.?周)\)?/) // 匹配周次字符串
                      weekStr[1]
                        .split(',')
                        .map(w => {
                          if (w.includes('-')) {
                            // 处理连续周次 (如1-5周)
                            const arr = w.split('-')
                            const arr1 = Array(arr[1] - arr[0] + 1)
                              .fill()
                              .map((v, i) => +i + +arr[0].trim())
                            // 处理单双周
                            if (weekStr[2] === '单周') {
                              return arr1.filter(v => v & 1) // 只保留奇数周
                            } else if (weekStr[2] === '双周') {
                              return arr1.filter(v => !(v & 1)) // 只保留偶数周
                            }
                            return arr1
                          } else {
                            return +w.trim() // 单个周次
                          }
                        })
                        .forEach(w => {
                          if (Array.isArray(w)) {
                            cls.weeks.push(...w) // 添加多个周次
                          } else {
                            cls.weeks.push(w) // 添加单个周次
                          }
                        })
                    // 处理课程信息分隔符
                    } else if (el2.next && el2.next.type === 'text') {
                      const text = el2.next.data.trim()
                      if (/^\-+$/.test(text)) { // 检测分隔线
                        // 遇到分隔线时保存当前课程信息
                        if (!cls.weeks) {
                          throw new Error('未匹配周次')
                        }
                        result.push(cls) // 将当前课程信息加入结果数组
                        // 初始化新的课程信息对象
                        cls = {
                          name: '',
                          day: i1,
                          sections: [2 * i - 1, 2 * i]
                        }
                      } else {
                        // 处理班级信息
                        if (config.isTeacher) {
                          if (/\d班/.test(text)) { // 匹配班级编号
                            cls.teacher = text
                          }
                        }
                      }
                    }
                  }
                })
              // 保存最后一个课程信息
              if (cls.name) {
                if (!cls.weeks) {
                  throw new Error('未匹配周次')
                }
                result.push(cls) // 将课程信息加入结果数组
              }
              console.info(cls) // 打印当前课程信息
            }
          }
        }
      })
    console.info(result) // 打印最终解析结果
    return result // 返回解析后的课程信息数组
  } catch (error) {
    console.error(error) // 打印错误信息
    throw error // 抛出异常
  }
}

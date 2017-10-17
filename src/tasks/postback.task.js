const moment = require('moment')

class PostBackTask {
  constructor () {
  }
  processPostBack () {
    const timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss:SSS')
    console.log(timeStamp)
    return
  }

  run () {
    this.processPostBack()
  }
}
module.exports = new PostBackTask()

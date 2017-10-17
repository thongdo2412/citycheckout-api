const moment = require('moment')

class TestTask {
  constructor () {
  }
  processTest () {
    const timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss:SSS')
    console.log(timeStamp)
    return
  }

  run () {
    this.processTest()
  }
}
module.exports = new TestTask()

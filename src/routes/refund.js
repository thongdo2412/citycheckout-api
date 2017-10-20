const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils')
const Promise = require('bluebird')

module.exports = [{
  path: '/api/refund',
  method: 'post',
  handler: (req, res) => {
    console.log("starting refund...")
    if (req.headers['x-kotn-webhook-verified'] != '200'){
      console.log('invalid signature for uninstall')
      res.status(204).send()
      return
    }else {
      let trans_id = ""
      let promises = []
      const gateway = getBrainTreeAuth()
      const refund = req.body.refund_line_items
      promises = refund.map((item) => { // assuming properties attribute used to store BT, name :"BT_trans_id"
        trans_id = item.line_item.properties[0].value
        if (trans_id) {
          console.log("going into refund")
          console.log(typeof(trans_id))
          console.log(trans_id)
          return gateway.transaction.refund(trans_id)
        }
      })
      console.log("going to promise")
      Promise.all(promises)
      .then(data => responseSuccess(res,{}))
      .catch(err => responseError(res, err))
    }
  }
}];

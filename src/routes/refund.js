const { responseError, responseSuccess, postToPayPal, postToExtAPI } = require('../helpers/utils')
const Promise = require('bluebird')
const config = require('../config')
module.exports = [{
  path: '/api/refund',
  method: 'post',
  handler: (req, res) => {
    console.log("starting refund...")
    if (req.headers['x-kotn-webhook-verified'] != '200'){
      console.log('invalid signature for webhook')
      res.status(204).send()
      return
    }else {
      const params = req.body
      const refund = params.refund_line_items
      const gateway = refund[0].line_item.properties[0].name
      if (gateway == 'CS_trans_id') {
        headers = {
          "CITYCHECKOUT-HMAC-SHA256": config.citycheckout.key
        }
        postToExtAPI('https://citybeauty.com/checkout/cybersource/src/CreditPayment.php',headers,params)
        .then(data => responseSuccess(res, {}))
        .catch(err => responseError(res, err))
      }
      else if (gateway == 'PP_trans_id') {
        let trans_id = ""
        let promises = []
        promises = refund.map((item) => { // assuming properties attribute used to store BT, name :"BT_trans_id"
          trans_id = item.line_item.properties[0].value
          if (trans_id) {
            let pBody = {}
            pBody.METHOD = 'RefundTransaction'
            pBody.TRANSACTIONID = trans_id
            return postToPayPal(pBody)
          }
        })
        Promise.all(promises)
        .then(data => responseSuccess(res, {}))
        .catch(err => responseError(res, err))
      }
    }
  }
}];

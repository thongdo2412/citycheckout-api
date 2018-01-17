const { responseError, responseSuccess, postToPayPal, postToExtAPI, getFrShopify } = require('../helpers/utils')
const Promise = require('bluebird')
const config = require('../config')
module.exports = [{
  path: '/api/refund',
  method: 'post',
  handler: (req, res) => {
    if (req.headers['citycheckout-hmac-sha256'] != config.citycheckout.key){
      console.log('invalid signature for webhook')
      res.status(204).send()
      return
    }else {
      console.log("starting refund...")
      const params = req.body
      let gateway = ""
      let trans_id = ""
      const url = `https://city-cosmetics.myshopify.com/admin/orders/${params.order_id}.json`
      const refund_amount = params.refund_amount
      getFrShopify(url)
      .then(data => {
        gateway = data.order.note_attributes[0].value
        const metafield_url = `https://city-cosmetics.myshopify.com/admin/orders/${params.order_id}/metafields.json`
        return getFrShopify(metafield_url)
      })
      .then(data => {
        if (data.metafields[0].value) {
          trans_id = data.metafields[0].value
          if (gateway == 'CyberSource') {
            headers = {
              "CITYCHECKOUT-HMAC-SHA256": config.citycheckout.key
            }
            cs_body = {
              "transaction_id": trans_id,
              "amount": refund_amount
            }
            return postToExtAPI('https://citybeauty.com/checkout/cybersource/src/CreditPayment.php',headers,cs_body,"json")
          }
          else if (gateway == 'PayPal') {
            let pBody = {}
            pBody.METHOD = 'RefundTransaction'
            pBody.REFUNDTYPE = 'Partial'
            pBody.AMT = refund_amount
            pBody.TRANSACTIONID = trans_id
            return postToPayPal(pBody)
          }
        }
      })
      .then(data => responseSuccess(res, data))
      .catch(err => responseError(res, err))
    }
  }
}];

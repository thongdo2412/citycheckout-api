const Promise = require('bluebird')
const config = require('../config')
const { responseError, responseSuccess, getOrderTable, postToThirdParties, constructShopifyBody, calculateTax } = require('../helpers/utils');
module.exports = [{
  path: '/api/postback',
  method: 'post',
  handler: (req, res) => {
    const checkoutID = req.body.checkoutID
    let payload = {}
    getOrderTable().query(checkoutID)
    .then((data) => {
      let clickID = ""
      let chtx = ""
      let shipAmount = 0
      let customerEmail = ""
      let customer = {}
      let shipping_address = {}
      let totalAmount = 0
      let line_items = []
      let tax_lines = []
      payload = data
      data.Items.map((item) => { // construct line items for this checkout id
        if (item.hasOwnProperty("click_id")) {
          clickID = item.click_id
          chtx = item.tax_rate
          shipAmount = item.shipping_amount
          customer = item.customer
          customerEmail = customer.email
          shipping_address = item.shipping_address
        }
        totalAmount += item.amount
        let properties = []
        properties.push({"name": "BT_trans_id", "value": item.trans_id})
        line_items.push({"variant_id": item.product.id, "quantity": 1, "properties": properties})
      })
      tax_lines.push(calculateTax(chtx,totalAmount,shipAmount))
      shopifyBody = constructShopifyBody(line_items,totalAmount,customer,shipping_address,tax_lines,customerEmail,shipAmount)
      return postToThirdParties(shopifyBody,clickID,totalAmount)
      // console.log(shopifyBody)
      // return responseSuccess(res, shopifyBody)
    })
    .then(data => {
      let promises = []
      promises = payload.Items.map((item) => {
        if (typeof item.sent_at === 'undefined') {
          return getOrderTable().updateSentField(item.key,item.date)
        }
      })
      return Promise.all(promises)
    })
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))
  }
}];

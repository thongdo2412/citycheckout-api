const Promise = require('bluebird')
const config = require('../config')
const { responseError, responseSuccess, getOrderTable, postToThirdParties, constructShopifyBody } = require('../helpers/utils');
module.exports = [{
  path: '/api/postback',
  method: 'post',
  handler: (req, res) => {
    const checkoutID = req.body.checkoutID
    let payload = {}
    getOrderTable().query(checkoutID)
    .then((data) => {
      let click_id = ""
      let tax_rate = 0.0
      let customerEmail = ""
      let customer = {}
      let shipping_address = {}
      let billing_address = {}
      let total_amount = 0.0
      let ship_amount = 0.0
      let total_tax_amount = 0.0
      let line_items = []
      let tax_lines = []
      let shopifyBody = {}
      payload = data
      data.Items.map((item) => { // construct line items for this checkout id
        if (item.click_id) {
          click_id = item.click_id
          tax_rate = item.tax_rate
          ship_amount = item.shipping_amount
          customer = item.customer
          customerEmail = customer.email
          shipping_address = item.shipping_address
          if (!shipping_address.address2) {
            shipping_address.address2 = ""
          }
          billing_address = item.billing_address
          if (!billing_address.address2) {
            billing_address.address2 = ""
          }
        }
        let properties = []
        properties.push({"name": "CS_trans_id", "value": item.trans_id})
        line_items.push({"variant_id": item.product.variant_id, "quantity": 1, "properties": properties})
        total_tax_amount += parseFloat(item.tax_amount)
        total_amount += parseFloat(item.amount)
      })
      console.log(total_tax_amount)
      tax_lines.push({"price": total_tax_amount, "rate": tax_rate, "title": "State tax"})
      shopifyBody = constructShopifyBody(line_items,total_amount,customer,shipping_address,billing_address,tax_lines,customerEmail,ship_amount)
      
      return postToThirdParties(shopifyBody,click_id,total_amount)
      // console.log(tax_lines)
      // return responseSuccess(res, shopifyBody)
      // return postToShopify(shopifyBody)
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

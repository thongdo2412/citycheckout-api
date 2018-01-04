const Promise = require('bluebird')
const config = require('../config')
const { responseError, responseSuccess, getOrderTable, constructShopifyBody, postToShopify, postToVoluum } = require('../helpers/utils')
module.exports = [{
  path: '/api/postback',
  method: 'post',
  handler: (req, res) => {
    const checkoutID = req.body.checkoutID
    let payload = {}
    let click_id = ""
    let total_amount = 0.0
    getOrderTable().query(checkoutID)
    .then((data) => {
      let tags = ""    
      let tax_rate = 0.0
      let customerEmail = ""
      let customer = {}
      let shipping_address = {}
      let billing_address = {}
      let ship_amount = 0.0
      let total_tax_amount = 0.0
      let line_items = []
      let tax_lines = []
      let shopifyBody = {}
      const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'
      payload = data
      data.Items.map((item) => { // construct line items for this checkout id
        if (item.click_id) {
          click_id = item.click_id
          tax_rate = parseFloat(item.tax_rate).toFixed(2)
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
          if (item.transaction_type == 'CS') {
            tags = item.transaction_id
          }
          else if (item.transaction_type == 'PP') {
            tags = "PP transaction"
          }
        }
        let properties = []
        if (item.transaction_type == 'CS') {
          properties.push({"name": "CS_trans_id", "value": "CS"})
        }
        else if (item.transaction_type == 'PP') {
          properties.push({"name": "PP_trans_id", "value": item.transaction_id})
        }
        line_items.push({"variant_id": item.product.variant_id, "quantity": 1, "properties": properties})
        total_tax_amount += parseFloat(item.tax_amount)
        total_amount += parseFloat(item.amount)
      })
      tax_lines.push({"price": total_tax_amount.toFixed(2), "rate": tax_rate, "title": "State tax"})
      shopifyBody = constructShopifyBody(line_items,total_amount,customer,shipping_address,billing_address,tags,tax_lines,customerEmail,ship_amount)
      // return postToThirdParties(shopifyURL,shopifyBody,click_id,total_amount)
      return postToShopify(shopifyURL,shopifyBody)
    })
    .then(data => {
      console.log(data.order.tags)
      const meta_body = {
        "metafield": {
          "key": "payment_token",
          "value": data.order.tags,
          "value_type": "string",
          "namespace": "global"
        }
      }
      const meta_url = `https://city-cosmetics.myshopify.com/admin/orders/${data.order.id}/metafields.json`;
      return postToShopify(meta_url, meta_body)
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
    .then(data => {
      return postToVoluum(click_id,total_amount)
    })
    .then(data => responseSuccess(res, data))
    .catch(err => {
      console.log(err)
      responseError(res, err)
    })
  }
}];

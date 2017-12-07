require('dotenv').config()
const _ = require('lodash')
const Promise = require('bluebird')
const moment = require('moment')
const { getOrderTable,postToThirdParties,constructShopifyBody } = require('../helpers/utils');
class PostBackTask {
  constructor () {
  }
  processPostBack () {
    const timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss:SSS')
    console.log(`begin postback scheduled task at...${timeStamp}`)
    let payload = {}
    getOrderTable().scan()
    .then((data) => {
      payload = data
      const grouped = _.mapValues(_.groupBy(data.Items, "key"))
      const keysName = Object.keys(grouped)

      const keysMap = keysName.map((name) => { // post multiple to Shopify
        let click_id = ""
        let product_price = 0.0
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
        grouped[name].map((item) => { //construct body for Shopify post
          if (item.click_id) {
            click_id = item.click_id
            tax_rate = item.tax_rate
            product_price = parseFloat(item.product.price)
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
          total_amount += parseFloat(item.amount)
          total_tax_amount += parseFloat(item.tax_amount)
        })
        tax_lines.push({"price": total_tax_amount, "rate": tax_rate, "title": "State tax"})
        shopifyBody = constructShopifyBody(line_items,total_amount,customer,shipping_address,billing_address,tax_lines,customerEmail,ship_amount)
        return postToThirdParties(shopifyBody,click_id,total_amount)
      })
      return Promise.all(keysMap)
    })
    .then(data => {
      const dbItems = payload.Items.map((item) => {
        if (typeof item.sent_at === 'undefined') {
          return getOrderTable().updateSentField(item.key,item.date)
        }
      })
      return Promise.all(dbItems)
    })
    .catch(err => console.log(err))
    console.log("end scheduled task postback...")
  }

  run () {
    this.processPostBack()
  }
}
module.exports = new PostBackTask()

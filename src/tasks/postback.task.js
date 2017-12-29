require('dotenv').config()
const _ = require('lodash')
const Promise = require('bluebird')
const moment = require('moment')
const { getOrderTable,postToThirdParties,constructShopifyBody,postToShopify } = require('../helpers/utils')
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
        let tags = ""
        const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'        
        grouped[name].map((item) => { //construct body for Shopify post
          if (item.click_id) {
            click_id = item.click_id
            tax_rate = parseFloat(item.tax_rate).toFixed(2)
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
            tags = item.transaction_id
          }
          line_items.push({"variant_id": item.product.variant_id, "quantity": 1})
          total_amount += parseFloat(item.amount)
          total_tax_amount += parseFloat(item.tax_amount)
        })
        tax_lines.push({"price": total_tax_amount.toFixed(2), "rate": tax_rate, "title": "State tax"})
        shopifyBody = constructShopifyBody(line_items,total_amount,customer,shipping_address,billing_address,tags,tax_lines,customerEmail,ship_amount)
        return postToThirdParties(shopifyURL,shopifyBody,click_id,total_amount)
      })
      return Promise.all(keysMap)
    })
    .then(data => {
      const metafieldsMap = data.map(item => {
        const meta_body = {
          "metafield": {
            "key": "payment_token",
              "value": item[0].order.tags,
              "value_type": "string",
              "namespace": "global"
          }
        }
        const meta_url = `https://city-cosmetics.myshopify.com/admin/orders/${item[0].order.id}/metafields.json`
        return postToShopify(meta_url, meta_body)
      })
      return Promise.all(metafieldsMap)
    })
    .then(data => {
      const dbItems = payload.Items.map((item) => {
        if (typeof item.sent_at === 'undefined') {
          return getOrderTable().updateSentField(item.key,item.date)
        }
      })
      return Promise.all(dbItems)
      console.log("end scheduled task postback...")
    })
    .catch(err => console.log(err))
  }

  run () {
    this.processPostBack()
  }
}
module.exports = new PostBackTask()

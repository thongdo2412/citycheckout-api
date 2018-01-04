require('dotenv').config()
const _ = require('lodash')
const Promise = require('bluebird')
const moment = require('moment')
const { getOrderTable,constructShopifyBody,postToShopify,postToVoluum } = require('../helpers/utils')
class PostBackTask {
  constructor () {
  }
  processPostBack () {
    const timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss:SSS')
    console.log(`begin postback scheduled task at...${timeStamp}`)
    let payload = {}
    let voluum_pb = []
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
          total_amount += parseFloat(item.amount)
          total_tax_amount += parseFloat(item.tax_amount)
        })
        voluum_pb.push({"click_id": click_id,"total_amount":total_amount})
        tax_lines.push({"price": total_tax_amount.toFixed(2), "rate": tax_rate, "title": "State tax"})
        shopifyBody = constructShopifyBody(line_items,total_amount,customer,shipping_address,billing_address,tags,tax_lines,customerEmail,ship_amount)
        return postToShopify(shopifyURL,shopifyBody)
      })
      return Promise.all(keysMap)
    })
    .then(data => {
      const metafieldsMap = data.map(item => {
        const meta_body = {
          "metafield": {
            "key": "payment_token",
              "value": item.order.tags,
              "value_type": "string",
              "namespace": "global"
          }
        }
        const meta_url = `https://city-cosmetics.myshopify.com/admin/orders/${item.order.id}/metafields.json`
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
    })
    .then(data =>{
      const volItems = voluum_pb.map((item) =>{
        return postToVoluum(item.click_id,item.total_amount)
      })
      return Promise.all(volItems)
      console.log("end scheduled task postback...")
    })
    .catch(err => console.log(err))
  }

  run () {
    this.processPostBack()
  }
}
module.exports = new PostBackTask()

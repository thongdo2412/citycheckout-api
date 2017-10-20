require('dotenv').config()
const _ = require('lodash')
const Promise = require('bluebird')
const moment = require('moment')
const { getOrderTable,postToExtAPI,postToThirdParties,constructShopifyBody,calculateTax } = require('../helpers/utils');
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
        let clickID = ""
        let chtx = ""
        let customerEmail = ""
        let customer = {}
        let shipping_address = {}
        let shipAmount = 0
        let totalAmount = 0
        let line_items = []
        let tax_lines = []
        grouped[name].map((item) => { //construct body for Shopify post
          if (item.hasOwnProperty("click_id")) {
            clickID = item.click_id
            chtx = item.charge_tax
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

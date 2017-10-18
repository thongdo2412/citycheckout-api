require('dotenv').config()
const _ = require('lodash')
const Promise = require('bluebird')
const moment = require('moment')
const { getOrderTable, postToExtAPI,postToVoluum,postToShopify,postToThirdParties,constructShopifyBody,constructCustomer,constructShippingAddress,calculateTax } = require('../helpers/utils');
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
        let shipping = {}
        let shipAmount = 0
        let totalAmount = 0
        let line_items = []
        let tax_lines = []

        grouped[name].map((item) => { //construct body for Shopify post
          if (item.hasOwnProperty("click_id")) {
            clickID = item.click_id
            chtx = item.charge_tax
            shipAmount = item.shipping_amount
            customer = constructCustomer(item.customer.firstName,item.customer.lastName,item.customer.email)
            customerEmail = customer.email
            shipping = constructShippingAddress(item.customer.firstName,
              item.customer.lastName, item.shipping.streetAddress, item.customer.phone,
            item.shipping.city, item.shipping.region, item.shipping.country, item.shipping.postalCode)
          }
          totalAmount += item.amount
          line_items.push({"variant_id": item.product.id, "quantity": 1, })
        })
        tax_lines.push(calculateTax(chtx,totalAmount,shipAmount))
        shopifyBody = constructShopifyBody(line_items,totalAmount,customer,shipping,tax_lines,customerEmail,shipAmount)
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

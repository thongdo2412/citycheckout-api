const Promise = require('bluebird')
const config = require('../config')
const _ = require('lodash')
const { responseError, responseSuccess, getOrderTable, postToExtAPI } = require('../helpers/utils');
module.exports = [{
  path: '/api/cronPB',
  method: 'get',
  handler: (req, res) => {
    console.log("starting the cron...")
    let payload = {}
    let volURL = []
    let clickID = ""
    let totalAmount = 0
    const url = "https://city-cosmetics.myshopify.com/admin/orders.json"
    const volBase = "https://vmhlw.voluumtrk2.com/postback"
    let shopifyPost = {
        "order": {
          "line_items": [],
          "transactions": [
            {
              "kind": "sale",
              "status": "success",
              "amount": 0
            }
          ],
          "shipping_lines": [
              {
                  "title": "Standard Shipping (3-5 Business Days)",
                  "price": "4.95",
                  "code": "CITY_FLAT",
                  "source": "CITY_flat"
              }
          ],
          "customer": {},
          "shipping_address": {},
          "tax_lines": [],
          "email": "",
          "currency": "USD"
        }
      }
      const headers = {
        "Content-Type": "application/json",
        "Authorization": config.shopify.authorization
      }

    getOrderTable().scan("sentAt","none")
    .then((data) => {
      payload = data
      items = data.Items
      let promises = []
      grouped = _.mapValues(_.groupBy(items, "key"))
      const keysName = Object.keys(grouped)
      // TODO: this is stupid 2 nested loop algorithm
      promises = keysName.map((name) => { // post multiple to Shopify
        grouped[name].map((item) => { //construct body for Shopify post
          if (item.key != null) {
            clickID = item.clickID
            const customer = {
              "first_name": item.customer.firstName,
              "last_name": item.customer.lastName,
              "email": item.customer.email,
            }
            const shippingAddress = item.shipping
            shopifyPost.order.email = customer.email
            shopifyPost.order.customer = customer

            const shipping = {
              "first_name": item.customer.firstName,
              "last_name": item.customer.lastName,
              "address1": shippingAddress.streetAddress,
              "phone": item.customer.phone,
              "city": shippingAddress.city,
              "province": shippingAddress.region,
              "country": shippingAddress.country,
              "zip": shippingAddress.postalCode
            }
            const chtx = item.chtx
            shopifyPost.order.shipping_address = shipping
          }
          totalAmount += item.amount
          shopifyPost.order.line_items.push({"variant_id": item.product.id, "quantity": 1, })
        })
        shopifyPost.order.transactions[0].amount = totalAmount
        if (chtx == "1") {
          totalTax = parseFloat((totalAmount * .09).toFixed(2))
          shopifyPost.order.tax_lines.push({ "price": totalTax, "rate": 0.09, "title": "State tax" })
        }
        else {
          shopifyPost.order.tax_lines.push({ "price": totalAmount, "rate": 0, "title": "State tax"})
        }
        volURL.push(`${volBase}?cid=${clickID}&payout=${totalAmount}`)
        return postToExtAPI(url, headers, shopifyPost)
      })
      return Promise.all(promises)
    })
    .then(data => {
      let promises = []
      promises = payload.Items.map((item) => { //update Order Table
        if (item.sentAt == "none") {
          return getOrderTable().updateSentField(item.key,item.date)
        }
      })
      return Promise.all(promises)
    })
    .then(data => {
      // to avoid bad request 400 from CORS of Voluum
      let promises = []
      promises = volURL.map((url) => { //post to Voluum
        return postToExtAPI(volURL,{},{})
      })
      return Promise.all(promises)
    })
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))
    console.log("Cron ended...")
  }
}];

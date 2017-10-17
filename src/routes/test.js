const Promise = require('bluebird');
const moment = require('moment');
const httpReq = require('request-promise')
const Shopify = require('shopify-api-node')
const config = require('../config')
const _ = require('lodash')
const { responseError, responseSuccess, getOrderTable, postToExtAPI,postToVoluum,postToShopify,postToThirdParties,constructShopifyBody,constructCustomer,constructShippingAddress,calculateTax } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    // const url = "https://vmhlw.voluumtrk2.com/postback"
    // const body = {
    //   "cid": "w3IDD2JDGT5FEF0913R29C8I",
    //   "payout": "10"
    // }
    //
    // postToExtAPI(url,{},body,"form")
    // const checkoutID = "Yw6e7D9szt"
    let payload = {}
    const checkoutID = "Yw6e7D9szt"

    getOrderTable().query(checkoutID)
    .then((data) => {
      let clickID = ""
      let chtx = ""
      let customerEmail = ""
      let customer = ""
      let shipping = ""
      let totalAmount = 0
      let line_items = []
      let tax_lines = []
      payload = data
      data.Items.map((item) => {
        if (item.hasOwnProperty("click_id")) {
          clickID = item.click_id
          chtx = item.chargeTax
          customer = constructCustomer(item.customer.firstName,item.customer.lastName,item.customer.email)
          customerEmail = customer.email
          shipping = constructShippingAddress(item.customer.firstName,
            item.customer.lastName, item.shipping.streetAddress, item.customer.phone,
          item.shipping.city, item.shipping.region, item.shipping.country, item.shipping.postalCode)
        }
        totalAmount += item.amount
        line_items.push({"variant_id": item.product.id, "quantity": 1, })
      })
      tax_lines.push(calculateTax(chtx,totalAmount))
      shopifyBody = constructShopifyBody(line_items,totalAmount,customer,shipping,tax_lines,customerEmail)
      return postToThirdParties(shopifyBody,clickID,totalAmount)
    })
    .then(data => {
      let promises = []
      promises = payload.Items.map((item) => {
        if (typeof item.sent_at === 'undefined') {
          return getOrderTable().updateSentField(item.key,item.date)
        }
      })
      return Promise.all(promises)
      // console.log(payload)
    })
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))

  }
}];

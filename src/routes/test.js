const Promise = require('bluebird');
const moment = require('moment');
const httpReq = require('request-promise')
const config = require('../config')
const _ = require('lodash')
const { responseError, responseSuccess, getOrderTable, postToExtAPI,postToVoluum,postToShopify,postToThirdParties,constructShopifyBody,constructCustomer,constructShippingAddress,calculateTax } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    checkoutID = "Yw6e7D9szt"
    let payload = {}
    getOrderTable().query(checkoutID)
    .then((data) => {
      let clickID = ""
      let chtx = ""
      let shipAmount = 0
      let customerEmail = ""
      let customer = {}
      let shipping = {}
      let totalAmount = 0
      let line_items = []
      let tax_lines = []
      payload = data
      data.Items.map((item) => {
        if (item.hasOwnProperty("click_id")) {
          console.log("enter")
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
      // return postToThirdParties(shopifyBody,clickID,totalAmount)
      return responseSuccess(res,shopifyBody)
      })
    // .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))

  }
}];

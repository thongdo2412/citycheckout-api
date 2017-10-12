const Promise = require('bluebird');
const moment = require('moment');
const httpReq = require('request-promise')
const config = require('../config')
const { responseError, responseSuccess, getOrderTable, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    const checkoutID = "YtsmH"
    let totalAmount = 0
    let customer = ""
    let shopifyPost = {
        "order": {
          "line_items": [
            {
              "variant_id": 0,
              "quantity": 1
            },
            {
              "variant_id": 0,
              "quantity": 1
            }
          ],
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
          "customer": {
            "first_name": "Test",
            "last_name": "Test",
            "email": ""
          },
          "shipping_address": {},
          "tax_lines": [
            {
              "price": 0,
              "rate": 0,
              "title": "State tax"
            }
          ],
          "email": "",
          "currency": "USD"
        }
      }
      const headers = {
        "Content-Type": "application/json",
        "Authorization": config.shopifyAPI.authorization
      }
    // getOrderTable().scan("sentAt","none")
    // .then((data) => {
    //   data.Items.forEach(function(item){
    //     if (item.key == checkoutID) {
    //       totalAmount += item.amount
    //       customer = item.customer
    //
    //     }
    //   })
    //   return responseSuccess(res,{"totalAmount": totalAmount})
    // })
    getOrderTable().query(checkoutID)
    .then((data) => {
      let counter = 0
      const customer = JSON.parse(data.Items[0].customer)
      const shippingAddress = JSON.parse(data.Items[0].shipping)
      shopifyPost.order.email = customer.email
      shopifyPost.order.customer.email = customer.email
      const shipping = {
        "first_name": "Test",
        "last_name": "Test",
        "address1": shippingAddress.streetAddress,
        "phone": customer.phone,
        "city": shippingAddress.city,
        "province": shippingAddress.region,
        "country": shippingAddress.countryCodeAlpha2,
        "zip": shippingAddress.postalCode
      }
      shopifyPost.order.shipping_address = shipping
      data.Items.forEach(function(item){
        if (item.sentAt == "none") {
          totalAmount += item.amount
          let product = JSON.parse(item.product)
          shopifyPost.order.line_items[counter].variant_id = product.id
          // getOrderTable.updateSentField(item.key,item.date)
          // .then(data => {
          //   return next()
          // })
          counter++
        }
      })
      shopifyPost.order.transactions[0].amount = totalAmount
      const options = {
        method: 'POST',
        uri: 'https://city-cosmetics.myshopify.com/admin/orders.json',
        headers: headers,
        body: shopifyPost,
        json: true // Automatically stringifies the body to JSON
      }
      console.log(shopifyPost)
      return httpReq(options)
    })
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))

  }
}];

const Promise = require('bluebird');
const moment = require('moment');
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
      shopifyPost.order.shipping_address = shippingAddress
      data.Items.forEach(function(item){
        if (item.sentAt == "none") {
          totalAmount += item.amount
          let product = JSON.parse(item.product)
          console.log(product.id)
          console.log(counter)
          shopifyPost.order.line_items[counter].variant_id = product.id
          counter++
        }
      })
        // const shippingAddress = JSON.parse(data.Items[0].shipping)
        // console.log(shippingAddress)
        // let counter = 0
        // shopifyPost.order.customer.email = customer.email
        // shopifyPost.order.email = customer.email
        // // shopifyPost.order.shipping_address = shippingAddress
        // console.log("done at if")
        // data.Items.forEach(function(item){
        //   totalAmount += item.amount
        //   const product = JSON.parse(item.product)
        //   shopifyPost.order.line_items[counter].variant_id = product.id
        //   counter++
        // })
        // console.log("done at loop")
      shopifyPost.order.transactions[0].amount = totalAmount
      console.log("done")
      return responseSuccess(res,shopifyPost)
    })
    // .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))

  }
}];

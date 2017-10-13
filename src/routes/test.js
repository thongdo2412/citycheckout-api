const Promise = require('bluebird');
const moment = require('moment');
const httpReq = require('request-promise')
const Shopify = require('shopify-api-node')
const config = require('../config')
const { responseError, responseSuccess, getOrderTable, getBrainTreeAuth,postToExtAPI } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    // const checkoutID = "Hy2e5"
    // const clickID = ""
    // const amount = 10
    // const customer = {
    //   "firstName": "David",
    //   "lastName": "Hyra",
    //   "company": "",
    //   "email": "blank@example.com",
    //   "phone": "1234567890"
    // }
    //
    // let shipping = {}
    // let product = {}
    // // getOrderTable().put(checkoutID, amount, clickID, customer, shipping, product)
    // getOrderTable().query(checkoutID)
    // .then(data => {
    //
    //   data.Items.forEach((item) => {
    //     if (item.clickID == null) {
    //       console.log("this is null")
    //     }
    //   })
    //   return responseSuccess(res, {"success": true})
    // })
    getOrderTable().scan("sentAt","none")
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))

  }
}];

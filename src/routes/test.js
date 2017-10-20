const Promise = require('bluebird')
const _ = require('lodash')
const { responseError, responseSuccess,getOrderTable, postToThirdParties, constructShopifyBody, calculateTax,getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/test',
  method: 'get',
  handler: (req, res) => {
    let promises = []
    const refund = [
      {
        "line_item":{
          "properties":[
            {
              "name": "BT_trans",
              "value": "k0qz60q9"
            }
          ]
        }
      },
      {
        "line_item":{
          "properties":[
            {
              "name": "BT_trans",
              "value": "ncv0cdk7"
            }
          ]
        }
      }
    ]
    const gateway = getBrainTreeAuth()
    promises = refund.map((item) => { // assuming properties attribute used to store BT, name :"BT_trans_id"
      trans_id = item.line_item.properties[0].value
      if (trans_id) {
        console.log("going into refund")
        console.log(typeof(trans_id))
        console.log(trans_id)
        return gateway.transaction.refund(trans_id)
      }
    })

    Promise.all(promises)
    .then(data => responseSuccess(res, data))
    .catch(err => responseError(res, err))
    // let payload = {}
    // getOrderTable().query("iyDUnc48Zk")
    // .then((data) => {
    //   let clickID = ""
    //   let chtx = ""
    //   let shipAmount = 0
    //   let customerEmail = ""
    //   let customer = {}
    //   let shipping_address = {}
    //   let totalAmount = 0
    //   let line_items = []
    //   let tax_lines = []
    //   payload = data
    //   data.Items.map((item) => { // construct line items for this checkout id
    //     if (item.hasOwnProperty("click_id")) {
    //       clickID =
    //       chtx = item.charge_tax
    //       shipAmount = item.shipping_amount
    //       customer = item.customer
    //       customerEmail = customer.email
    //       shipping_address = item.shipping_address
    //     }
    //     let properties = []
    //     properties.push({"name": "BT_trans_id", "value": item.trans_id})
    //     line_items.push({"variant_id": item.product.id, "quantity": 1, "properties": properties})
    //     totalAmount += item.amount
    //   })
    //   tax_lines.push(calculateTax(chtx,totalAmount,shipAmount))
    //   shopifyBody = constructShopifyBody(line_items,totalAmount,customer,shipping_address,tax_lines,customerEmail,shipAmount)
    //   // return postToThirdParties(shopifyBody,clickID,totalAmount)
    //   // console.log(shopifyBody)
    //   return responseSuccess(res, shopifyBody)
    // })
    // // .then(data => responseSuccess(res, data))
    // .catch(err => responseError(res, err))

  }
}];

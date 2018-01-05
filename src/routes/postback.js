const Promise = require('bluebird')
const config = require('../config')
const { responseError, responseSuccess, getOrderTable, constructShopifyBody, postToShopify, postToVoluum, putToShopify } = require('../helpers/utils')
module.exports = [{
  path: '/api/postback',
  method: 'post',
  handler: (req, res) => {
    const checkoutID = req.body.checkoutID
    let payload = {}
    let click_id = ""
    let total_amount = 0.0
    getOrderTable().query(checkoutID)
    .then((data) => {
      let customerEmail = ""
      let customer = {}
      let shipping_address = {}
      let billing_address = {}
      let ordersPromises = []
      let tax_rate = 0.0
      const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'
      payload = data
      data.Items.map((item) => {
        //for voluum postback
        total_amount += parseFloat(item.amount)
        if (item.click_id) { 
          click_id = item.click_id // for voluum postback 
        } 
        if (item.order_type == "parent") {
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
          tax_rate = item.tax_rate
        }
      })
      ordersPromises = data.Items.map((item) => { // construct Shopify order
        let tags = ""
        let note = ""
        let line_items = []
        let tax_lines = []
        let shopifyBody = {}
        
        // if (item.click_id) { // parent order and copy all the customer's info
        //   click_id = item.click_id // for voluum postback
        //   tax_rate = parseFloat(item.tax_rate).toFixed(2)
        //   ship_amount = item.shipping_amount
        //   customer = item.customer
        //   customerEmail = customer.email
        //   shipping_address = item.shipping_address
        //   if (!shipping_address.address2) {
        //     shipping_address.address2 = ""
        //   }
        //   billing_address = item.billing_address
        //   if (!billing_address.address2) {
        //     billing_address.address2 = ""
        //   }
        //   if (item.transaction_type == 'CS') {
        //     tags = item.transaction_id
        //   }
        //   else if (item.transaction_type == 'PP') {
        //     tags = "PP_transaction"
        //   }
        // }
        tags = item.transaction_id
        if (item.order_type == "parent"){
          note = "parent"
        }
        else if (item.order_type == "child") {
          note = "child"
        }

        line_items.push({"variant_id": item.product.variant_id, "quantity": 1})
        tax_lines.push({"price": item.tax_amount, "rate": tax_rate, "title": "State tax"})
        shopifyBody = constructShopifyBody(line_items,item.amount,customer,shipping_address,billing_address,tags,note,tax_lines,customerEmail,item.shipping_amount)
        return postToShopify(shopifyURL,shopifyBody)
      })
      return Promise.all(ordersPromises)
    })
    .then(data => {
      let updatePromises = []
      let parent_num = ""
      let child_nums = ""

      data.map(item => {
        if (item.order.note == "parent") {
          parent_num = item.order.name
        }
        else if (item.order.note == "child") {
          child_nums += `${item.order.name},`
        }
      })

      updatePromises = data.map(item => {
        let note = ""
        if (data.length != 1) {
          if (item.order.note == "parent") {
            note = `Upsell orders: ${child_nums}`
          }
          else if (item.order.note == "child") {
            note = `Parent order: ${parent_num}`
          }
        }
        
        order_body = {
          "order": {
            "id": item.order.id,
            "note": note,
            "metafields": [
              {
                "key": "transaction_id",
                "value": item.order.tags,
                "value_type": "string",
                "namespace": "global"
              }
            ]
          }
        }
        const order_url = `https://city-cosmetics.myshopify.com/admin/orders/${item.order.id}.json`;
        return putToShopify(order_url, order_body)
      })
      return Promise.all(updatePromises)
    })
    .then(data => {
      let promises = []
      promises = payload.Items.map((item) => {
        if (typeof item.sent_at === 'undefined') {
          return getOrderTable().updateSentField(item.key,item.date)
        }
      })
      return Promise.all(promises)
    })
    .then(data => {
      return postToVoluum(click_id,total_amount)
    })
    .then(data => responseSuccess(res, data))
    .catch(err => {
      responseError(res, err)
    })
  }
}];

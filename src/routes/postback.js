const Promise = require('bluebird')
const config = require('../config')
const { responseError, responseSuccess, getOrderTable, postToVoluum, putToShopify } = require('../helpers/utils')
module.exports = [{
  path: '/api/postback',
  method: 'post',
  handler: (req, res) => {
    console.log("Postback at end of funnel endpoint...")
    const checkoutID = req.body.checkoutID
    let payload = {}
    let click_id = ""
    let total_amount = 0.0
    getOrderTable().query(checkoutID)
    .then((data) => {
      payload = data
      let updatePromises = []
      let parent_num = ""
      let child_nums = ""

      data.Items.map(item => {
        // for Voluum postback
        if (item.click_id) {
          click_id = item.click_id 
        }
        total_amount += parseFloat(item.amount)

        if (item.order_type == "parent order") {
          parent_num = item.shopify_order_name
        }
        else if (item.order_type == "upsell order") {
          child_nums += `${item.shopify_order_name} `
        }
      })

      updatePromises = data.Items.map(item => {
        let note = ""
        if (data.Count > 1) {
          if (item.order_type == "parent order") {
            note = `Upsell orders: ${child_nums}`
          }
          else if (item.order_type == "upsell order") {
            note = `Parent order: ${parent_num}`
          }
        }
        
        let order_body = {
          "order": {
            "id": item.shopify_order_id,
            "note": note
          }
        }
        const order_url = `https://city-cosmetics.myshopify.com/admin/orders/${item.shopify_order_id}.json`;
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

require('dotenv').config()
const _ = require('lodash')
const Promise = require('bluebird')
const moment = require('moment')
const { getOrderTable,constructShopifyBody,postToShopify,postToVoluum,putToShopify } = require('../helpers/utils')
class PostBackTask {
  constructor () {
  }
  processPostBack () {
    const timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss:SSS')
    console.log(`begin postback scheduled task at...${timeStamp}`)
    let payload = {}
    let voluum_pb = []
    const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'            
    getOrderTable().scan()
    .then((data) => {
      payload = data
      const grouped = _.mapValues(_.groupBy(data.Items, "key"))
      const keysName = Object.keys(grouped)
      const keysMap = keysName.map((name) => { // post multiple orders to Shopify with different checkoutids
        let click_id = ""
        let orderPromises = []
        let total_amount = 0.0
        let parent_num = ""
        let child_nums = ""

        grouped[name].map((item) => { //construct body and post to Shopify with same checkoutid
          // for Voluum postback
          if (item.click_id) {
            click_id = item.click_id 
          }
          total_amount += parseFloat(item.amount)
          
          // identify if the order is parent or child order
          if (item.order_type == "parent order"){
            parent_num = item.shopify_order_name
          }
          else if (item.order_type == "upsell order") {
            child_nums += `${item.shopify_order_name} `
          }
        })

        orderPromises = grouped[name].map((item) => {
          let note = ""
          if (grouped[name].length > 1) {
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
        voluum_pb.push({"click_id": click_id,"total_amount":total_amount}) // data for Voluum postback
        return Promise.all(orderPromises)
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
    .then(data => {
      const volItems = voluum_pb.map((item) =>{
        return postToVoluum(item.click_id,item.total_amount)
      })
      return Promise.all(volItems)
      console.log("end scheduled task postback...")
    })
    .catch(err => console.log(err))
  }

  run () {
    this.processPostBack()
  }
}
module.exports = new PostBackTask()

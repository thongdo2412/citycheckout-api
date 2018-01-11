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
        let tax_rate = 0.0
        let customerEmail = ""
        let customer = {}
        let shipping_address = {}
        let billing_address = {}
        let orderPromises = []
        let total_amount = 0.0
        
        grouped[name].map((item) => { 
          if (item.click_id) {
            click_id = item.click_id // holds clickid for Voluum postback
          }
          total_amount += parseFloat(item.amount)
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

        orderPromises = grouped[name].map((item) => { //construct body and post to Shopify with same checkoutid
          let tags = ""
          let note = ""
          let line_items = []
          let tax_lines = []
          let variant_arr = []
          let shopifyBody = {}

          if (item.order_type == "parent"){
            note = "parent"
          }
          else if (item.order_type == "child") {
            note = "child"
          }
          tags = item.transaction_id
          variant_arr = item.product.variant_id.split(",") // for color combo orders
          if (variant_arr.length > 1) {
            variant_arr.map(variant => {
              line_items.push({"variant_id": variant, "quantity": item.product.quantity})
            })
          }
          else {
            line_items.push({"variant_id": item.product.variant_id, "quantity": item.product.quantity})
          }
          tax_lines.push({"price": item.tax_amount, "rate": tax_rate, "title": "State tax"})
          shopifyBody = constructShopifyBody(line_items,item.amount,customer,shipping_address,billing_address,tags,note,item.transaction_type,tax_lines,customerEmail,item.shipping_amount,item.product.discount_amount)
          return postToShopify(shopifyURL,shopifyBody)
        })
        voluum_pb.push({"click_id": click_id,"total_amount":total_amount}) // data for Voluum postback
        return Promise.all(orderPromises)
      })
      return Promise.all(keysMap)
    })
    .then(data => {
      let chkoutPromises = []
      let ordersPromises = []

      chkoutPromises = data.map(chkout_item => {
        let parent_num = ""
        let child_nums = ""

        chkout_item.map(order_item => {
          if (order_item.order.note == "parent") {
            parent_num = order_item.order.name
          }
          else if (order_item.order.note == "child") {
            child_nums += `${order_item.order.name} `
          }
        })

        ordersPromises = chkout_item.map(order_item => {
          let note = ""
          let order_body = {}

          if (chkout_item.length != 1) {
            if (order_item.order.note == "parent") {
              note = `Upsell orders: ${child_nums}`
            }
            else if (order_item.order.note == "child") {
              note = `Parent order: ${parent_num}`
            }
          }
        
          order_body = {
            "order": {
              "id": order_item.order.id,
              "note": note,
              "metafields": [
                {
                  "key": "transaction_id",
                  "value": order_item.order.tags,
                  "value_type": "string",
                  "namespace": "global"
                }
              ]
            }
          }
          const order_url = `https://city-cosmetics.myshopify.com/admin/orders/${order_item.order.id}.json`;
          return putToShopify(order_url, order_body)
        })
        return Promise.all(ordersPromises)
      })
      return Promise.all(chkoutPromises)
    })
    .then(data => {
      const dbItems = payload.Items.map((item) => {
        if (typeof item.sent_at === 'undefined') {
          return getOrderTable().updateSentField(item.key,item.date)
        }
      })
      return Promise.all(dbItems)
    })
    .then(data =>{
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

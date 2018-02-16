const { responseError, responseSuccess, getOrderTable, constructShopifyBody, postToShopify, putToShopify, getCardName } = require('../helpers/utils');
module.exports = [{
  path: '/api/savetodb',
  method: 'post',
  handler: (req, res) => {
    console.log("Received post request from Cybersource and save to DB endpoint...")
    const params = req.body
    let company = ""
    let billing_company = ""
    let ship_to_address_line2 = ""
    let bill_to_address_line2 = "" 
    if (params.reason_code == '100') {
      const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'
      const checkout_id = params.req_merchant_defined_data5
      const amount = params.req_amount
      const click_id = params.req_merchant_defined_data6
      const phone = params.req_ship_to_phone
      const card_number = params.req_card_number
      const card_name = getCardName(params.req_card_type)

      let order_type = ""
      let tags = ""
      let note = ""
      let line_items = []
      let tax_lines = []
      let variant_arr = []
      let note_attributes = []
      let shopifyBody = {}
      let shopify_order_id = ""
      let shopify_order_name = ""

      const customer = {
        "first_name": params.req_ship_to_forename,
        "last_name": params.req_ship_to_surname,
        "email": params.req_bill_to_email
      }

      const product = {
        "variant_id": params.req_merchant_defined_data7,
        "quantity": params.req_merchant_defined_data12,
        "discount_amount": params.req_merchant_defined_data13
      }

      //check if those optional fields are blank
      if (params.req_ship_to_company_name) {
        company = params.req_ship_to_company_name
      }

      if (params.req_bill_to_company_name) {
        billing_company = params.req_bill_to_company_name
      }

      if (params.req_ship_to_address_line2) {
        ship_to_address_line2 = params.req_ship_to_address_line2
      }

      if (params.req_bill_to_address_line2) {
        bill_to_address_line2 = params.req_bill_to_address_line2
      }

      const shipping_address = {
        "first_name": params.req_ship_to_forename,
        "last_name": params.req_ship_to_surname,
        "company": company,
        "address1": params.req_ship_to_address_line1,
        "address2": ship_to_address_line2,
        "province": params.req_ship_to_address_state,
        "city": params.req_ship_to_address_city,
        "phone": phone,
        "zip": params.req_ship_to_address_postal_code,
        "country": params.req_ship_to_address_country
      }
      const billing_address = {
        "first_name": params.req_bill_to_forename,
        "last_name": params.req_bill_to_surname,
        "company": billing_company,
        "address1": params.req_bill_to_address_line1,
        "address2": bill_to_address_line2,
        "province": params.req_bill_to_address_state,
        "city": params.req_bill_to_address_city,
        "phone": phone,
        "zip": params.req_bill_to_address_postal_code,
        "country": params.req_bill_to_address_country
      }

      const shipping_amount = params.req_merchant_defined_data8
      const tax_amount = params.req_tax_amount
      const tax_rate = params.req_merchant_defined_data11
      let pmt_token = ""
      if (params.payment_token) {
        pmt_token = params.payment_token
        order_type = "parent order"
        note = "parent order"
        tags = pmt_token
      }
      else {
        pmt_token = params.req_payment_token
        order_type = "upsell order"
        note = "upsell order"
        tags = pmt_token
      }

      variant_arr = params.req_merchant_defined_data7.split(",") // for color combo orders
      if (variant_arr.length > 1) {
        variant_arr.map(variant => {
          line_items.push({"variant_id": variant, "quantity": params.req_merchant_defined_data12})
        })
      }
      else {
        line_items.push({"variant_id": params.req_merchant_defined_data7, "quantity": params.req_merchant_defined_data12})
      }
      tax_lines.push({"price": tax_amount, "rate": tax_rate, "title": "State tax"})
      note_attributes.push({"name": "gateway","value": "CyberSource"},{"name": "card number","value": params.req_card_number},{"name": "card type","value": card_name})
      shopifyBody = constructShopifyBody(line_items,amount,customer,shipping_address,billing_address,tags,note,note_attributes,tax_lines,customer.email,shipping_amount,product.discount_amount)
      console.log("Create order to Shopify")
      postToShopify(shopifyURL,shopifyBody)
      .then (data => {
        shopify_order_id = data.order.id
        shopify_order_name = data.order.name
        let order_body = {
          "order": {
            "id": data.order.id,
            "metafields": [
              {
                "key": "transaction_id",
                "value": data.order.tags,
                "value_type": "string",
                "namespace": "global"
              }
            ]
          }
        }
        const order_url = `https://city-cosmetics.myshopify.com/admin/orders/${data.order.id}.json`;
        return putToShopify(order_url, order_body)
      })
      .then (data => {
        return getOrderTable().put(checkout_id, amount, click_id, customer, shipping_address, billing_address, product, tax_rate, tax_amount, shipping_amount, pmt_token, "CyberSource", order_type, shopify_order_id, shopify_order_name)
      })
      .then(data => responseSuccess(res, data))
      .catch((err) => {
        const body = { error_message: `Problem in creating transactions. ${err.display_message}` }
        responseError(res, body)
      })
    }
  }
}];

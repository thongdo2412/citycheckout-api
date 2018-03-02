const Promise = require('bluebird')
const _ = require('lodash')
const { responseError, responseSuccess, getOrderTable, constructShopifyBody, postToShopify } = require('../helpers/utils');
module.exports = [{
  path: '/api/createshopifyorder',
  method: 'post',
  handler: (req, res) => {
    console.log("create shopify order endpoint...")
    const params = req.body
    let company = ""
    let billing_company = ""
    let ship_to_address_line2 = ""
    let bill_to_address_line2 = ""
    const shopifyURL = 'https://city-cosmetics.myshopify.com/admin/orders.json'
    let shopifyBody = {}
    const amount = params.amount
    const phone = params.ship_to_phone

    let note = "parent order"
    let line_items = []
    let tax_lines = []
    let variant_arr = []
    let note_attributes = []
    let shopify_order_id = ""
    let shopify_order_name = ""

    const customer = {
        "first_name": params.ship_to_forename,
        "last_name": params.ship_to_surname,
        "email": params.bill_to_email
    }

    const product = {
        "variant_id": params.merchant_defined_data7,
        "quantity": params.merchant_defined_data12,
        "discount_amount": params.merchant_defined_data13
    }

    //check if those optional fields are blank
    if (params.ship_to_company_name) {
        company = params.ship_to_company_name
    }

    if (params.bill_to_company_name) {
        billing_company = params.bill_to_company_name
    }

    if (params.ship_to_address_line2) {
        ship_to_address_line2 = params.ship_to_address_line2
    }

    if (params.bill_to_address_line2) {
        bill_to_address_line2 = params.bill_to_address_line2
    }

    const shipping_address = {
        "first_name": params.ship_to_forename,
        "last_name": params.ship_to_surname,
        "company": company,
        "address1": params.ship_to_address_line1,
        "address2": ship_to_address_line2,
        "province": params.ship_to_address_state,
        "city": params.ship_to_address_city,
        "phone": phone,
        "zip": params.ship_to_address_postal_code,
        "country": params.ship_to_address_country
    }
    const billing_address = {
        "first_name": params.bill_to_forename,
        "last_name": params.bill_to_surname,
        "company": billing_company,
        "address1": params.bill_to_address_line1,
        "address2": bill_to_address_line2,
        "province": params.bill_to_address_state,
        "city": params.bill_to_address_city,
        "phone": phone,
        "zip": params.bill_to_address_postal_code,
        "country": params.bill_to_address_country
    }

    const shipping_amount = params.merchant_defined_data8
    const tax_amount = params.tax_amount
    const tax_rate = params.merchant_defined_data11
    variant_arr = params.merchant_defined_data7.split(",") // for color combo orders
    if (variant_arr.length > 1) {
        variant_arr.map(variant => {
            line_items.push({"variant_id": variant, "quantity": params.merchant_defined_data12})
        })
    }
    else {
        line_items.push({"variant_id": params.merchant_defined_data7, "quantity": params.merchant_defined_data12})
    }
    tax_lines.push({"price": tax_amount, "rate": tax_rate, "title": "State tax"})
    note_attributes.push({"name": "gateway","value": "CyberSource"})
    shopifyBody = constructShopifyBody(line_items,amount,customer,shipping_address,billing_address,note,note_attributes,tax_lines,customer.email,shipping_amount,product.discount_amount,"authorization","pending")
    console.log(shopifyBody.order)
    postToShopify(shopifyURL,shopifyBody)
    .then(data => {
        responseSuccess(res,{"shopify_order_id": data.order.id})
    })
    .catch((err) => {
        const body = { error_message: `Problem in creating order in Shopify. ${err.display_message}` }
        console.log(body)
        responseError(res, body)
    })
  }
}];

const KMS = require('aws-sdk/clients/kms');
const { DynamoTable } = require('../helpers/dynamo');
const kms = new KMS();
const httpReq = require('request-promise')
const Promise = require('bluebird')
const config = require('../config')
const cryptoJS = require('crypto-js')

function responseSuccess(res, body = {}, statusCode = 200) {
  return res.status(statusCode).json(body);
}

function responseError(res, body, statusCode = 400) {
  return responseSuccess(res, body, statusCode);
}

function getOrderTable() {
  return new DynamoTable();
}

function postToExtAPI (url,headers,body,contentType) {
  let options = {
    method: 'POST',
    uri: url,
    headers: headers,
  }

  if (contentType == "json") {
    options.body = body
    options.json = true
  }else if (contentType == "form") {
    options.form = body
  }
  return httpReq(options)
}

// components to construct Shopify body for the order post
function getShippingLines(ship_amount) {
  let shippinglines = []
  if (ship_amount > 0) {
    shippinglines.push({
        "title": "Standard Shipping (3-5 Business Days)",
        "price": `${ship_amount}`,
        "code": "CITY_FLAT",
        "source": "CITY_flat"
    })
  }
  else {
    shippinglines.push({
      "title": "Free Standard Shipping (3-5 Business Days)",
      "price": "0.00",
      "code": "CITY_FLAT",
      "source": "CITY_flat"
    })
  }
  return shippinglines
}

function getDiscountCodes (discount_amt) {
  let discount_codes = []
  if (discount_amt > 0) {
    discount_codes = [
      {
        "code": "FTC-PROMO",
        "amount": discount_amt,
        "type": "fixed_amount"
      }
    ]
  }
  return discount_codes
}

function constructShopifyBody (line_items, amount, customer, shipping, billing, note, note_attributes, tax_lines, customerEmail, ship_amount, discount_amt, transaction_kind,financial_status) {
  const shippinglines = getShippingLines(ship_amount)
  const discount_codes = getDiscountCodes(discount_amt)

  shopifyBody = {
    "order": {
      "line_items": line_items,
      "transactions": [
        {
          "kind": transaction_kind,
          "status": "success",
          "amount": amount
        }
      ],
      "financial_status": financial_status,
      "shipping_lines": shippinglines,
      "customer": customer,
      "email": customerEmail,
      "shipping_address": shipping,
      "billing_address": billing,
      // "tags": tags, remove tags for now, will add later if needed
      "note": note,
      "note_attributes": note_attributes,
      "discount_codes": discount_codes,
      "tax_lines": tax_lines,
      "total_discounts": discount_amt,
      "total_price": amount,
      "total_tax": tax_lines[0].price,
      "currency": "USD"
    }
  }
  return shopifyBody
}

function postToShopify(url,body) {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": config.shopify.password
  }
  return postToExtAPI(url,headers,body,"json")
}

function putToShopify(url,body) {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": config.shopify.password
  }
  let options = {
    method: 'PUT',
    uri: url,
    headers: headers,
    body: body,
    json: true
  }
  return httpReq(options)
}

function deleteToShopify(url) {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": config.shopify.password
  }
  let options = {
    method: 'DELETE',
    uri: url,
    headers: headers
  }
  return httpReq(options)
}

function getFrShopify(url) {
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": config.shopify.password
  }
  let options = {
    uri: url,
    headers: headers,
    resolveWithFullResponse: true,
    json: true
  }
  return httpReq(options)
}

function postToVoluum(cid,payout) {
  const volURL = "https://vmhlw.voluumtrk2.com/postback"
  body = {
    "cid": cid,
    "payout": payout
  }
  return postToExtAPI(volURL,{},body,"form")
}
function sign (params) {
  return signData(buildDataToSign(params), config.Cybersource.SECRET_KEY)
}

function buildDataToSign(params) {
  let dataToSign = []
  const signedFieldNames = params.signed_field_names.split(',')
  signedFieldNames.map(item => {
      dataToSign.push(`${item}=${params[item]}`)
  })
  return dataToSign.join()
}

function signData(data,secret_key) {
  const hash = cryptoJS.HmacSHA256(data, secret_key)
  return cryptoJS.enc.Base64.stringify(hash)  
}

function postToPayPal(body) {
  body.USER = config.Paypal.user
  body.PWD = config.Paypal.pwd
  body.SIGNATURE = config.Paypal.signature
  body.VERSION = '204'
  // const paypal_url = config.Paypal.sandbox_url
  const paypal_url = config.Paypal.production_url
  return postToExtAPI(paypal_url,{},body,"form")
}

function strToJSON(data) {
  data = decodeURIComponent(data) // decode back to UTF
  let output = data.split('&').reduce(function(o, pair) {
    pair = pair.split('=')
    return o[pair[0]] = pair[1], o}, {}
  )
  return output
}

function calTax(data) { // for paypal
  let rate = 0
  if (data == "CA") {
    rate = 0.09
  }
  else if (data == "UT") {
    rate = 0.0676
  }
  return rate
}

function calShipping(data,amount) { // for paypal
  let rate = 0
  if (data == 'US') {
    if (parseFloat(amount) <= 50) {
      rate = 4.95
    }
    else {
      rate = 0
    }
  }
  else if (data =='CA'){
    rate = 9.95
  }
  else {
    rate = 19.95
  }
  return rate
}

function getCardName(card_type) {
  if (card_type == '001') {
    return "Visa"
  } else if (card_type == '002') {
    return "Mastercard"
  } else if (card_type == '003') {
    return "American Express"
  } else if (card_type == '004') {
    return "Discover"
  } else {
    return "Not supported"
  }
}

function getShopAPILimit(){
  return getFrShopify("https://city-cosmetics.myshopify.com/admin/products/count.json")
}

module.exports = {
  responseSuccess,
  responseError,
  getOrderTable,
  postToVoluum,
  postToShopify,
  postToExtAPI,
  putToShopify,
  constructShopifyBody,
  sign,
  strToJSON,
  postToPayPal,
  calTax,
  calShipping,
  getFrShopify,
  getCardName,
  getShopAPILimit,
};

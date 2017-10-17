const plaid = require('plaid');
const KMS = require('aws-sdk/clients/kms');
const { DynamoTable } = require('../helpers/dynamo');
const braintree = require('braintree');
const kms = new KMS();
const httpReq = require('request-promise')
const Promise = require('bluebird')
const config = require('../config')

function responseSuccess(res, body = {}, statusCode = 200) {
  return res.status(statusCode).json(body);
}

function responseError(res, body, statusCode = 400) {
  return responseSuccess(res, body, statusCode);
}

function getOrderTable() {
  return new DynamoTable();
}

function getBrainTreeAuth() {
  return braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BT_PUBLIC_KEY,
    privateKey: process.env.BT_PRIVATE_KEY
  });
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

function constructShopifyBody (line_items, amount, customer, shipping, tax_lines, customerEmail) {
  shopifyBody = {
        "order": {
          "line_items": line_items,
          "transactions": [
            {
              "kind": "sale",
              "status": "success",
              "amount": amount
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
          "customer": customer,
          "shipping_address": shipping,
          "tax_lines": tax_lines,
          "email": customerEmail,
          "currency": "USD"
        }
  }
  return shopifyBody
}

function constructCustomer(firstName,lastName,email) {
  customer = {
    "first_name": firstName,
    "last_name": lastName,
    "email": email,
  }
  return customer
}

function constructShippingAddress(firstName,lastName,streetAddress,phone,city,region,country,postalCode) {
  shipping = {
    "first_name": firstName,
    "last_name": lastName,
    "address1": streetAddress,
    "phone": phone,
    "city": city,
    "province": region,
    "country": country,
    "zip": postalCode
  }
  return shipping
}

function calculateTax(chtx,totalAmount){
  if (chtx == "1") {
    totalTax = parseFloat((totalAmount * .09).toFixed(2))
    return  { "price": totalTax, "rate": 0.09, "title": "State tax" }
  }
  else {
    return { "price": 0, "rate": 0, "title": "State tax"}
  }
}

function postToThirdParties(shopifyBody,cid,payout) {
  return Promise.all([postToShopify(shopifyBody), postToVoluum(cid,payout)])
}

function postToShopify(body) {
  const shopURL = "https://city-cosmetics.myshopify.com/admin/orders.json"
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": config.shopify.password
  }
  return postToExtAPI(shopURL,headers,body,"json")
}

function postToVoluum(cid,payout) {
  const volURL = "https://vmhlw.voluumtrk2.com/postback"
  body = {
    "cid": cid,
    "payout": payout
  }
  return postToExtAPI(volURL,{},body,"form")
}

module.exports = {
  responseSuccess,
  responseError,
  getBrainTreeAuth,
  getOrderTable,
  postToExtAPI,
  postToThirdParties,
  postToVoluum,
  postToShopify,
  constructShopifyBody,
  constructShippingAddress,
  constructCustomer,
  calculateTax,
};

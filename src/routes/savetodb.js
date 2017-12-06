const { responseError, responseSuccess, getOrderTable } = require('../helpers/utils');
module.exports = [{
  path: '/api/savetodb',
  method: 'post',
  handler: (req, res) => {
    const params = req.body
    if (params.reason_code == '100') {
      const checkout_id = params.req_merchant_defined_data5
      const amount = params.req_amount
      const click_id = params.req_merchant_defined_data6
      const phone = params.req_ship_to_phone
      let company = ""
      let billingCompany = ""
      let ship_to_address_line2 = ""
      let bill_to_address_line2 = ""

      const customer = {
        "first_name": params.req_ship_to_forename,
        "last_name": params.req_ship_to_surname,
        "email": params.req_bill_to_email
      }

      const product = {
        "variant_id": params.req_merchant_defined_data7
      }

      //check if those optional fields are blank
      if (params.req_ship_to_company_name) {
        company = params.req_ship_to_company_name
      }

      if (params.req_bill_to_company_name) {
        const billingCompany = params.req_bill_to_company_name
      }

      if (params.req_ship_to_address_line2) {
        const ship_to_address_line2 = params.req_ship_to_address_line2
      }

      if (params.req_bill_to_address_line2) {
        const bill_to_address_line2 = params.req_bill_to_address_line2
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
        "company": billingCompany,
        "address1": params.req_bill_to_address_line1,
        "address2": bill_to_address_line2,
        "province": params.req_bill_to_address_state,
        "city": params.req_bill_to_address_city,
        "phone": phone,
        "zip": params.req_bill_to_address_postal_code,
        "country": params.req_bill_to_address_country
      }

      const shipping_amount = params.req_merchant_defined_data8
      const tax_rate = params.req_tax_amount
      const trans_id = params.transaction_id
      const pmt_token = params.payment_token

      getOrderTable().put(checkout_id, amount, click_id, customer, shipping_address, billing_address, product, tax_rate, shipping_amount, trans_id, pmt_token)
      .then(data => responseSuccess(res, data))
      .catch((err) => {
        const body = { error_message: `Problem in creating transactions. ${err.display_message}` }
        responseError(res, body)
      })
    }
  }
}];

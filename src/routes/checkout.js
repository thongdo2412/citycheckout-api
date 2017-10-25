const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable} = require('../helpers/utils');
module.exports = [{
  path: '/api/checkout',
  method: 'post',
  handler: (req, res) => {
    const amount = req.body.amount;
    const nonce = req.body.nonce;
    const checkoutID = req.body.checkoutID;
    const email = req.body.email;
    const nameOnCard = req.body.nameoncard;

    // shipping address
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const company = req.body.company;
    const streetAddress = req.body.streetAddress;
    const extendedAddress = req.body.extendedAddress;
    const city = req.body.city;
    const region = req.body.region;
    const country = req.body.country;
    const postalCode = req.body.postalCode;
    const phone = req.body.phone;

    // billing address
    const billingFirstName = req.body.billingFirstName;
    const billingLastName = req.body.billingLastName;
    const billingCompany = req.body.billingCompany;
    const billingStreetAddress = req.body.billingStreetAddress;
    const extendedBillingAddress = req.body.extendedBillingAddress;
    const billingCity = req.body.billingCity;
    const billingCountry = req.body.billingCountry;
    const billingRegion = req.body.billingRegion;
    const BillingPostalCode = req.body.BillingPostalCode;

    //product
    const product = req.body.product;
    const clickID = req.body.clickID;
    const tax_rate = req.body.tax_rate;
    const ship_amount = req.body.shipAmount;

    const customer = {
      "first_name": firstname,
      "last_name": lastname,
      "email": email
    }

    const shipping_address = {
      "first_name": firstname,
      "last_name": lastname,
      "company": company,
      "address1": streetAddress,
      "address2": extendedAddress,
      "province": region,
      "city": city,
      "phone": phone,
      "zip": postalCode,
      "country": country
    }
    billing_address = {
      "first_name": billingFirstName,
      "last_name": billingLastName,
      "company": billingCompany,
      "address1": billingStreetAddress,
      "address2": extendedBillingAddress,
      "province": billingRegion,
      "city": billingCity,
      "phone": phone,
      "zip": BillingPostalCode,
      "country": billingCountry
    }

    let payload = {}
    let trans_id = ""
    const gateway = getBrainTreeAuth()
    gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonce,
        creditCard: {
          cardholderName: nameOnCard
        },
        customer: {
          firstName: firstname,
          lastName: lastname,
          company: company,
          phone: phone,
          email: email
        },
        billing: {
          firstName: billingFirstName,
          lastName: billingLastName,
          company: billingCompany,
          streetAddress: billingStreetAddress,
          extendedAddress: extendedBillingAddress,
          locality: billingCity,
          region: billingRegion,
          postalCode: BillingPostalCode,
          countryCodeAlpha2: billingCountry
        },
        shipping: {
          firstName: firstname,
          lastName: lastname,
          company: company,
          streetAddress: streetAddress,
          extendedAddress: extendedAddress,
          locality: city,
          region: region,
          postalCode: postalCode,
          countryCodeAlpha2: country
        },
        options: {
          submitForSettlement: true,
          storeInVaultOnSuccess: true,
          addBillingAddressToPaymentMethod: true
        }
    })
    .then(data => {
      payload = data
      trans_id = data.transaction.id
      console.log(trans_id)
      return getOrderTable().put(checkoutID, amount, clickID, customer, shipping_address, billing_address, product, tax_rate, ship_amount, trans_id)
    })
    .then(data => responseSuccess(res, payload))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` }
      responseError(res, body)
    });
  }
}];

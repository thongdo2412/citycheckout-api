const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable} = require('../helpers/utils');
const moment = require('moment');
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

    const product = req.body.product;
    const clickID = req.body.clickID;
    const chtx = req.body.chtx;
    const shipAmount = req.body.shipAmount

    const customer = {
      "firstName": firstname,
      "lastName": lastname,
      "company": company,
      "phone": phone,
      "email": email
    }

    const shippingAddress = {
      "firstName": firstname,
      "lastName": lastname,
      "company": company,
      "streetAddress": streetAddress,
      "extendedAddress": extendedAddress,
      "region": region,
      "city": city,
      "postalCode": postalCode,
      "country": country
    }

    let payload = {}
    const gateway = getBrainTreeAuth();
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
      return getOrderTable().put(checkoutID, amount, clickID, customer, shippingAddress, product, chtx, shipAmount)
    })
    .then(data => responseSuccess(res, payload))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    });
  }
}];

const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils');
const moment = require('moment');
module.exports = [{
  path: '/api/checkout',
  method: 'post',
  handler: (req, res) => {
    const amount = req.body.amount;
    const nonce = req.body.nonce;
    const email = req.body.email;
    const nameOnCard = req.body.nameoncard;

    //shipping address
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const company = req.body.company;
    const streetAddress = req.body.streetAddress;
    const extendedAddress = req.body.extendedAddress;
    const city = req.body.city;
    const country = req.body.country;

    if (req.body.usState != null) {
      const region = req.body.usState
    }
    else {
      const region = req.body.caProvince
    }

    const postalCode = req.body.postalCode;
    const phone = req.body.phone;
    const product = req.body.product;
    const clickId = req.body.voluumClickID;

    const customer = {
      firstName: firstname,
      lastName: lastname,
      company: company,
      phone: phone,
      email: email
    };

    const shippingAddress = {
      firstName: firstname,
      lastName: lastname,
      company: company,
      streetAddress: streetAddress,
      extendedAddress: extendedAddress,
      locality: city,
      region: region,
      postalCode: postalCode,
      countryCodeAlpha2: country
    };

    const billingAddress = {
      firstName: firstname,
      lastName: lastname,
      company: company,
      streetAddress: streetAddress,
      extendedAddress: extendedAddress,
      locality: city,
      region: region,
      postalCode: postalCode,
      countryCodeAlpha2: country
    };

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
    .then(data  => responseSuccess(res, data))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    });
  }
}];

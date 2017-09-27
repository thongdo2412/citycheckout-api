const { responseError, responseSuccess, getAccountTable, getPlaid } = require('../helpers/utils');
const braintree = require("braintree");
module.exports = [{
  path: '/api/checkout',
  method: 'post',
  handler: (req, res) => {
    var amount = req.body.amount;
    var nonce = req.body.nonce;
    var email = req.body.email;
    var nameOnCard = req.body.nameoncard;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var company = req.body.company;
    var streetAddress = req.body.streetAddress;
    var extendedAddress = req.body.extendedAddress;
    var city = req.body.city;
    var country = req.body.country;
    var region = req.body.region;
    var postalCode = req.body.postalCode;
    var phone = req.body.phone;

    const gateway = braintree.connect({
      environment: braintree.Environment.Sandbox,
      merchantId: process.env.BT_MERCHANT_ID,
      publicKey: process.env.BT_PUBLIC_KEY,
      privateKey: process.env.BT_PRIVATE_KEY
    });

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
        storeInVaultOnSuccess: true
      }
    }, function (err, result) {
      if (result.success || result.transaction) {
        console.log("data is saved");
      } else {
        transactionErrors = result.errors.deepErrors();
        req.flash('error', {msg: formatErrors(transactionErrors)});
      }
    });
  }
}];

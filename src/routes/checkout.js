const { responseError, responseSuccess, getAccountTable, getPlaid, getBrainTreeAuth } = require('../helpers/utils');
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
          storeInVaultOnSuccess: true
        }
      })
    .then(data => responseSuccess(res, data))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    });
  }
}];

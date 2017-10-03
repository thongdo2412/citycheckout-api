const { responseError, responseSuccess, getAccountTable, getPlaid, getBrainTreeAuth } = require('../helpers/utils');
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
    const region = req.body.region;
    const postalCode = req.body.postalCode;
    const phone = req.body.phone;
    //add billing address

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
    .then(data => responseSuccess(res, data))
    .catch((err) => {
      const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
      responseError(res, body);
    });
  }
}];

const { responseError, responseSuccess, getAccountTable, getPlaid, getBrainTreeAuth, getOrderTable } = require('../helpers/utils');
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
    const region = req.body.region;
    const postalCode = req.body.postalCode;
    const phone = req.body.phone;
    const product = req.body.product;
    const clickId = req.body.voluumClickID;
    //TODO: add billing address

    const date = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');

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

    const items = {
      key: email,
      date: date,
      product: product,
      customer: customer,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress,
      clickid: clickId,
      sent: false
    };

  getOrderTable().put(items)
  .then(data => responseSuccess(res, data))
  .catch(err => responseError(res, err));
  // .then(function(val){
  //   const gateway = getBrainTreeAuth();
  //
  //   gateway.transaction.sale({
  //       amount: amount,
  //       paymentMethodNonce: nonce,
  //       creditCard: {
  //         cardholderName: nameOnCard
  //       },
  //       customer: {
  //         firstName: firstname,
  //         lastName: lastname,
  //         company: company,
  //         phone: phone,
  //         email: email
  //       },
  //       billing: {
  //         firstName: firstname,
  //         lastName: lastname,
  //         company: company,
  //         streetAddress: streetAddress,
  //         extendedAddress: extendedAddress,
  //         locality: city,
  //         region: region,
  //         postalCode: postalCode,
  //         countryCodeAlpha2: country
  //       },
  //       shipping: {
  //         firstName: firstname,
  //         lastName: lastname,
  //         company: company,
  //         streetAddress: streetAddress,
  //         extendedAddress: extendedAddress,
  //         locality: city,
  //         region: region,
  //         postalCode: postalCode,
  //         countryCodeAlpha2: country
  //       },
  //       options: {
  //         submitForSettlement: true,
  //         storeInVaultOnSuccess: true,
  //         addBillingAddressToPaymentMethod: true
  //       }
  //     })
  //   })
    // .catch((err) => {
    //   const body = { error_message: `Problem in creating transactions. ${err.display_message}` };
    //   responseError(res, body);
    // });
    // .catch((e) => {
    //   responseError(res, e);
    // });

  }
}];

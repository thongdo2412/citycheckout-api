const { responseError, responseSuccess, getAccountTable, getPlaid } = require('../helpers/utils');
const braintree = require("braintree");
module.exports = [{
  path: '/api/checkout',
  method: 'post',
  handler: (req, res) => {
    var amount = req.body.amount;
    var nonce = req.body.nonce;
    var nameOnCard = req.body.nameoncard;

    const gateway = braintree.connect({
      environment: braintree.Environment.Sandbox,
      merchantId: process.env.BT_MERCHANT_ID,
      publicKey: process.env.BT_PUBLIC_KEY,
      privateKey: process.env.BT_PRIVATE_KEY
    });

    gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: nonce,
      cardholderName: nameOnCard,
      options: {
        submitForSettlement: true
      }
    }, function (err, result) {
      if (err) {
        console.error(err);
        return;
      }
    });
  }
}];

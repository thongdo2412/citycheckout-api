const { responseError, responseSuccess, getAccountTable, getPlaid } = require('../helpers/utils');
const braintree = require("braintree");
module.exports = [{
  path: '/api/client-token',
  method: 'get',
  handler: (req, res) => {

    const gateway = braintree.connect({
      environment: braintree.Environment.Sandbox,
      merchantId: process.env.BT_MERCHANT_ID,
      publicKey: process.env.BT_PUBLIC_KEY,
      privateKey: process.env.BT_PRIVATE_KEY
    });

    gateway.clientToken.generate({}, function (err, response) {
      res.send(response.clientToken);
    });

  },
}];

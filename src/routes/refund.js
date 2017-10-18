const { responseError, responseSuccess, getBrainTreeAuth, getOrderTable } = require('../helpers/utils')
const crypto = require('crypto')
const config = require('../config')
module.exports = [{
  path: '/api/refund',
  method: 'post',
  handler: (req, res) => {
    const SECRET = config.shopify.webhooks_secret

    function verifyShopifyHook(req) {
      var digest = crypto.createHmac('SHA256', SECRET)
              .update(new Buffer(req.body, 'utf8'))
              .digest('base64');

      return digest === req.headers['X-Shopify-Hmac-Sha256'];
    }

    // function parseRequestBody(req, res) {
    //   req.body = '';
    //
    //   req.on('data', function(chunk) {
    //       req.body += chunk.toString('utf8');
    //   });
    //   req.on('end', function() {
    //       handleRequest(req, res);
    //   });
    // }

    function handleRequest(req, res) {
      if (verifyShopifyHook(req)) {
          console.log("handle verified request")
          res.writeHead(200);
          res.end('Verified webhook');
          return responseSuccess(res,{})
      } else {
          res.writeHead(401);
          res.end('Unverified webhook');
          return responseError(res, err)
      }
    }

  }
}];

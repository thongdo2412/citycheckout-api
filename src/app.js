const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// const { parseUserInfo } = require('./helpers/middlewares');

const app = express();
app.use(cors());

app.use(bodyParser.json({verify: function(req, res, buf, encoding) {
    const shopHMAC = req.get('x-shopify-hmac-sha256');
    if(!shopHMAC) return;
    if(req.get('x-kotn-webhook-verified')) throw "Unexpected webhook verified header";
    const sharedSecret = config.shopify.webhooks_secret;
    const digest = crypto.createHmac('SHA256', sharedSecret).update(buf).digest('base64');
    if(digest == req.get('x-shopify-hmac-sha256')){
        req.headers['x-kotn-webhook-verified']= '200';
    }
 }}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());
// app.use(parseUserInfo);

function comsumeApi(apiPath) {
  const apis = require(apiPath);
  apis.forEach(api => app[_.toLower(api.method)](api.path, api.handler))
}

const routeDir = path.join(__dirname, 'routes');
fs.readdirSync(routeDir).forEach((file) => {
  const routeFilePath = path.resolve(path.join(routeDir, file));
  comsumeApi(routeFilePath);
});

module.exports = app

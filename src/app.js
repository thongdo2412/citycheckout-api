const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

const { parseUserInfo } = require('./helpers/middlewares');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(parseUserInfo);

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

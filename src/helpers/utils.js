const plaid = require('plaid');
const KMS = require('aws-sdk/clients/kms');
const { DynamoTable } = require('../helpers/dynamo');
const braintree = require("braintree");

const kms = new KMS();

function decrypt(key) {
  const params = {
    CiphertextBlob: Buffer.from(key, 'base64'),
  };

  return new Promise((resolve, reject) => {
    kms.decrypt(params, (err, data) => {
      if (err) reject(err);
      else resolve(data.Plaintext.toString());
    });
  });
}

function getPlaidConfig() {
  const promises = [
    decrypt(process.env.PLAID_CLIENT_ID),
    decrypt(process.env.PLAID_SECRET),
  ];

  return Promise.all(promises)
    .then(([PLAID_CLIENT_ID, PLAID_SECRET]) => ({
      PLAID_CLIENT_ID,
      PLAID_SECRET,
      PLAID_PUBLIC_KEY: process.env.PLAID_PUBLIC_KEY,
      PLAID_ENV: process.env.PLAID_ENV,
    }));
}

function getPlaid() {
  return getPlaidConfig()
    .then((config) => {
      const {
        PLAID_CLIENT_ID,
        PLAID_SECRET,
        PLAID_PUBLIC_KEY,
        PLAID_ENV,
      } = config;

      return new plaid.Client(PLAID_CLIENT_ID, PLAID_SECRET, PLAID_PUBLIC_KEY,
        plaid.environments[PLAID_ENV]);
    });
}

function responseSuccess(res, body = {}, statusCode = 200) {
  return res.status(statusCode).json(body);
}

function responseError(res, body, statusCode = 400) {
  return responseSuccess(res, body, statusCode);
}

function getAccountTable(req) {
  const tableName = process.env.PLAID_ENV === 'sandbox' ? `${process.env.PLAID_ENV}-${process.env.ACCOUNT_TABLE}` : process.env.ACCOUNT_TABLE;
  return new DynamoTable(tableName, req.userInfo.username);
}

function getOrderTable(req) {
  const tableName = process.env.ORDER_TABLE;
  return new DynamoTable(tableName, req.body.email);
}

function getBrainTreeAuth() {
  return braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BT_MERCHANT_ID,
    publicKey: process.env.BT_PUBLIC_KEY,
    privateKey: process.env.BT_PRIVATE_KEY
  });
}

module.exports = {
  getPlaid,
  decrypt,
  responseSuccess,
  responseError,
  getAccountTable,
  getBrainTreeAuth,
  getOrderTable,
};

const moment = require('moment');
const _ = require('lodash');
const {
  responseError,
  responseSuccess,
  getAccountTable,
  getPlaid,
  decrypt,
} = require('../helpers/utils');

function getAccessTokens(req) {
  return getAccountTable(req).simpleGet('access-tokens')
    .then((data) => {
      // Decrypt all access tokens in parallel
      const promises = Object.keys(data.tokens).map(token => decrypt(token));
      return Promise.all(promises);
    });
}

module.exports = [{
  path: '/api/transactions',
  method: 'get',
  handler: (req, res) => {
    // Get access tokens and Plaid in parallel
    Promise.all([getAccessTokens(req), getPlaid()])
      .then(([tokens, plaidClient]) => {
        // Query transaction from now to 10 days ago
        // TODO: use param for transaction query
        const now = moment();
        const today = now.format('YYYY-MM-DD');
        const thirtyDaysAgo = now.subtract(10, 'days').format('YYYY-MM-DD');

        // Get transaction in parallel
        const promises = tokens.map(token => plaidClient.getTransactions(token, thirtyDaysAgo, today));
        return Promise.all(promises);
      })
      .then((logins) => {
        // Get all bank accounts in returned object
        const accounts = logins.reduce((accountsList, login) => accountsList.concat(login.accounts), []);
        // Filter duplicate accounts
        const uniqAccounts = _.uniqBy(accounts, 'account_id');

        // Get all transactions in returned object
        const transactions = logins.reduce((transactionsList, login) => transactionsList.concat(login.transactions), []);
        // Filter duplicate transactions
        const uniqTransactions = _.uniqBy(transactions, 'transaction_id');

        return {
          accounts: uniqAccounts,
          transactions: uniqTransactions,
        };
      })
      .then(data => responseSuccess(res, data))
      .catch(err => responseError(res, err));
  },
}];

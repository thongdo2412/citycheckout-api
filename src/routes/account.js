const { responseError, responseSuccess, getAccountTable } = require('../helpers/utils');

module.exports = [
  {
    path: '/api/accounts',
    method: 'get',
    handler: (req, res) => {
      getAccountTable(req).simpleGet('accounts')
        .then((data) => {
          const accounts = Object.keys(data).map(key => data[key]);
          return responseSuccess(res, { accounts });
        })
        .catch(err => responseError(res, err));
    },
  },
];

const { responseSuccess, getAccountTable } = require('../helpers/utils');


module.exports = [
  {
    path: '/api/networth',
    method: 'get',
    handler: (req, res) => {
      getAccountTable(req).simpleGet('networth')
        .then(data => responseSuccess(res, data))
        .catch(() => responseSuccess(res, { networth: 0 }));
    },
  }
];

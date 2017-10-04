const { responseError, responseSuccess, getAccountTable } = require('../helpers/utils');

module.exports = [
  {
    path: '/api/setting',
    method: 'get',
    handler: (req, res) => {
      getAccountTable(req).simpleGet('setting')
        .then(data => responseSuccess(res, data))
        .catch(err => responseError(res, err));
    },
  },
  {
    path: '/api/setting',
    method: 'put',
    handler: (req, res) => {
      const payload = {
        last_updated: Date.now(),
      };

      const settingFields = new Set(['email', 'slack', 'app']);
      Object.keys(req.body).map((key) => {
        if (settingFields.has(key)) payload[key] = req.body[key];
        return null;
      });

      getAccountTable(req).simpleUpdate('setting', payload)
        .then(data => responseSuccess(res, data))
        .catch(err => responseError(res, err));
    },
  },
];

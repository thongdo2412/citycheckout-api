const Promise = require('bluebird');
const moment = require('moment');
const { responseError, responseSuccess, getAccountTable, getPlaid, getBrainTreeAuth } = require('../helpers/utils');
module.exports = [{
  path: '/api/moment',
  method: 'get',
  handler: (req, res) => {
    // data = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    data = moment().format();
    console.log(typeof(data));
    return responseSuccess(res,data);
  }
}];

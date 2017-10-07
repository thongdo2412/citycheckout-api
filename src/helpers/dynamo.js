const config = require('../config');
const AWS = config.AWS
const db = new AWS.DynamoDB.DocumentClient()
const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');

class DynamoTable {
  constructor() {
    this.config = config
    this.tableName = this.config.db.tables.order.name
    this.partitionKey = this.config.db.tables.order.partition
    this.sortKey = this.config.db.tables.order.sort
  }

  get(key, date) {
    const params ={
      TableName : this.tableName,
      Key: {
        "key": key,
        "date": date
      }
    };
    return db.get(params).promise()
        .then(item => Promise.resolve(item.Item))
  }

  put(key,amount,clickid, mapCustomer, mapBilling, mapShipping, mapProduct) {
    const date = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    const params ={
      TableName : this.tableName,
      Item: {
        "key": key,
        "date": date,
        "click_id": clickid,
        customer: mapCustomer,
        billing: mapBilling,
        shipping: mapShipping,
        product: mapProduct,
        amount: amount,
        sent: false
      }
    }
    return db.put(params).promise()
  }

  query (key){
    //TODO: this is not done, finish this method

    const MS_PER_MINUTE = 60000;
    const myStartDate = moment(new Date(Date.now() - 45 * MS_PER_MINUTE));
    const timeNow = moment().format('YYYY-MM-DDTHH:mm:ss:SSS')
    console.log(moment().format())
    console.log(myStartDate)
    const params = {
      TableName : this.tableName,
      KeyConditionExpression: "#hk = :hkey and date between :date1 and :date2",
      ExpressionAttributeNames:{
        "#hk": "key"
      },
      ExpressionAttributeValues: {
        ":yyyy":key,
        ":date1": myStartDate,
        ":date2": timeNow
      }
    }
    return db.query(params).promise()
  }
  scan(field,fieldValue) {
    const params = {
      TableName: this.tableName,
      FilterExpression: `${field} = :field`,
      ExpressionAttributeValues : {':field' : fieldValue}
    }
    console.log(params)
    return db.scan(params).promise()
  }

  updateSentField(key, date) {
    const params = {
      TableName: this.tableName,
      Key: {
        "key" : key,
        "date": date
      },
      UpdateExpression: 'set #s = :trueVal',
      ExpressionAttributeNames: {'#s' : 'sent'},
      ExpressionAttributeValues: {
        ':trueVal': true
      }
    }
    return db.update(params).promise()
  }

  // query (key) {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: key
  //   }
  //
  //   return db.get(params).promise()
  //     .then(item => Promise.resolve(item.Item))
  // }

  // update (key, payload, action = 'PUT') {
  //   const transformedPayload = {}
  //   payload.last_updated = payload.last_updated || moment().utc().format()
  //   _.map(payload, (val, key) => {
  //     transformedPayload[key] = { Value: val, Action: action }
  //   })
  //
  //   const params = {
  //     TableName: this.tableName,
  //     Key: key,
  //     AttributeUpdates: transformedPayload
  //   }
  //
  //   return db.update(params).promise()
  // }
  //
  // append (key, attribute, value) {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: key,
  //     UpdateExpression: `ADD ${attribute} :value`,
  //     ExpressionAttributeValues: { ':value': db.createSet([value]) }
  //   }
  //
  //   return db.update(params).promise()
  // }
  //
  // put (key, data) {
  //   const params = {
  //     TableName: this.tableName,
  //     Item: _.extend(key, data)
  //   }
  //
  //   return db.put(params).promise()
  // }
  //
  // scan () {
  //   return 'TODO: implement me!'
  // }

  /*
    Construct the Partition Key based on username
  */
  // key (key, fields) {
  //   const key = {}
  //
  //   if (fields) {
  //     if (!_.isArray(fields)) fields = [fields]
  //     key[this.partitionKey] = [key].concat(fields).join('|')
  //   } else {
  //     key[this.partitionKey] = key
  //   }
  //
  //   if (!this.sortKey) {
  //     key[this.sortKey] = '2017/01/01'
  //   }
  //   // TODO: implement sort key if a table has it
  //   // if (this.sortKey) key[this.sortKey] = '2017/01/01'
  //
  //   return key
  // }
}

module.exports = {
  DynamoTable,
};

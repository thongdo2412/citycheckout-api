const DynamoDB = require('aws-sdk/clients/dynamodb');
const config = require('../config');
const dynamoDB = new DynamoDB.DocumentClient();
// const db = new DynamoDB.DocumentClient();
const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');

function handleDynamoResponse(resolve, reject) {
  return (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data.Item);
    }
  };
}

function generatePayload(payload) {
  // const newPayload = payload;

  // if (!('last_updated' in newPayload)) newPayload.last_updated = Date.now();

  // Object.keys(newPayload).map(key => newPayload[key] = { // eslint-disable-line
  //   Value: newPayload[key],
  //   Action: action,
  // });
  return JSON.stringify(payload);
}

class DynamoTable {
  constructor() {
    this.config = config
    this.tableName = this.config.db.tables.order.name
    this.partitionKey = this.config.db.tables.order.partition
    this.sortKey = this.config.db.tables.order.sort
  }

    construcKey(key, date) {
      const Keys = {
        key: key,
        date: date
      };
      return JSON.stringify(Keys);
    }

    // simpleGet(key, date) {
    //   const params = {
    //     TableName: this.tableName,
    //     Key: this.construcKey(key, date),
    //   };
    //
    //   return new Promise((resolve, reject) => {
    //     dynamoDB.get(params, handleDynamoResponse(resolve, reject));
    //   })
    //     .then((res) => {
    //       if (!res) throw Error('Not found.');
    //
    //       // const data = res;
    //       // if (data instanceof Object && 'key' in data) delete data.key;
    //
    //       return res;
    //     });
    // }

    put(payload) {
      const params ={
        TableName: this.tableName,
        Item: generatePayload(payload)
      };
      return new Promise((resolve, reject) => {
        dynamoDB.put(params, handleDynamoResponse(resolve, reject));
      });
    }

    // simpleUpdate(key, date, payload) {
    //   const params = {
    //     TableName: this.tableName,
    //     Key: this.construcKey(key, date),
    //     AttributeUpdates: generatePayload(payload, 'PUT'),
    //   };
    //   return new Promise((resolve, reject) => {
    //     dynamoDB.update(params, handleDynamoResponse(resolve, reject));
    //   });
    // }
    //
    // addToSet(field, date, attribute, value) {
    //   const params = {
    //     TableName: this.tableName,
    //     Key: this.construcKey(field, date),
    //     UpdateExpression: `ADD ${attribute} :value`,
    //     ExpressionAttributeValues: { ':value': dynamoDB.createSet([value]) },
    //   };
    //
    //   return new Promise((resolve, reject) => {
    //     dynamoDB.update(params, (err, data) => {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(data.Item);
    //       }
    //     });
    //   });
    // }

  // query (key) {
  //   const params = {
  //     TableName: this.tableName,
  //     Key: key
  //   }
  //
  //   return db.get(params).promise()
  //     .then(item => Promise.resolve(item.Item))
  // }
  //
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

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

  put(key, amount, clickid, customer, shipping, product) {
    const date = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    const params ={
      TableName : this.tableName,
      Item: {
        "key": key,
        "date": date,
        "click_id": clickid,
        "amount": amount,
        "customer": customer,
        "shipping": shipping,
        "product": product,
        "sentAt": "none"
      }
    }
    console.log(params)
    return db.put(params).promise()
  }

  updateSentField(key, date) {
    const sentAt = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    const params = {
      TableName: this.tableName,
      Key: {
        "key" : key,
        "date": date
      },
      UpdateExpression: 'set #s = :timestamp',
      ExpressionAttributeNames: {'#s' : 'sentAt'},
      ExpressionAttributeValues: {
        ':timestamp': sentAt
      }
    }
    return db.update(params).promise()
  }

  scan(field, fieldValue) {
    const params = {
      TableName: this.tableName,
      FilterExpression: `${field} = :field`,
      ExpressionAttributeValues : {':field' : fieldValue}
    }
    return db.scan(params).promise()
  }

  query(key){
    //TODO: this is not done, finish this method
    const params = {
      TableName : this.tableName,
      KeyConditionExpression: "#pk = :pk",
      ExpressionAttributeNames:{
        "#pk": "key"
      },
      ExpressionAttributeValues: {
        ":pk": key
      }
    }
    return db.query(params).promise()
  }

}

module.exports = {
  DynamoTable,
};

// scan(field,fieldValue) {
//   const params = {
//     TableName: this.tableName,
//     FilterExpression: `${field} = :field`,
//     ExpressionAttributeValues : {':field' : fieldValue}
//   }
//   return db.scan(params).promise()
// }
//
// updateSentField(key, date) {
//   const sentAt = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
//   const params = {
//     TableName: this.tableName,
//     Key: {
//       "key" : key,
//       "date": date
//     },
//     UpdateExpression: 'set #s = :timestamp',
//     ExpressionAttributeNames: {'#s' : 'sentAt'},
//     ExpressionAttributeValues: {
//       ':timestamp': sentAt
//     }
//   }
//   return db.update(params).promise()
// }


// query (key){
//   //TODO: this is not done, finish this method
//   const MS_PER_MINUTE = 60000;
//   const myStartDate = new Date(Date.now() - 45 * MS_PER_MINUTE);
//   console.log(typeof(myStartDate))
//   const params = {
//     TableName : this.tableName,
//     "key": key,
//
//     // KeyConditions: {
//     //   'date': {
//     //     ComparisonOperator: 'GE',
//     //     AttributeValueList: myStartDate
//     //   }
//     // }
//   }
//   return db.query(params).promise()
// }

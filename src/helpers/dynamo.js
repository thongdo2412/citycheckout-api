const config = require('../config')
const AWS = config.AWS
const db = new AWS.DynamoDB.DocumentClient(options = {convertEmptyValues: true})
const _ = require('lodash')
const moment = require('moment')
const Promise = require('bluebird')

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

  put(key, amount, clickid, customer, shipping_address, billing_address, product, tax_rate, tax_amount, ship_amount, transid, pmt_token) {
    const date = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    const params ={
      TableName : this.tableName,
      Item: {
        "key": key,
        "date": date,
        "click_id": clickid,
        "amount": amount,
        "customer": customer,
        "shipping_address": shipping_address,
        "billing_address": billing_address,
        "product": product,
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "shipping_amount": ship_amount,
        "trans_id": transid,
        "payment_token": pmt_token,
      }
    }
    return db.put(params).promise()
  }

  updateSentField(key, date) {
    const sent_at = moment().format('YYYY-MM-DDTHH:mm:ss:SSS');
    const params = {
      TableName: this.tableName,
      Key: {
        "key" : key,
        "date": date
      },
      UpdateExpression: 'set #s = :timestamp',
      ExpressionAttributeNames: {'#s' : 'sent_at'},
      ExpressionAttributeValues: {
        ':timestamp': sent_at
      }
    }
    return db.update(params).promise()
  }

  scan() {
    const myStartDate = moment(new Date(Date.now() - (45 * 60000))).format('YYYY-MM-DDTHH:mm:ss:SSS');
    console.log(myStartDate)
    const params = {
      TableName: this.tableName,
      FilterExpression: "attribute_not_exists(#sent) and #rk < :time",
      ExpressionAttributeNames: {
        "#sent": "sent_at",
        "#rk": "date",
      },
      ExpressionAttributeValues: {
        ":time": myStartDate
      },
    }
    return db.scan(params).promise()
  }

  query(key){
    const params = {
      TableName : this.tableName,
      KeyConditionExpression: "#pk = :pk",
      FilterExpression: "attribute_not_exists(#sent)",
      ExpressionAttributeNames:{
        "#pk": "key",
        "#sent": "sent_at"
      },
      ExpressionAttributeValues: {
        ":pk": key,
      },
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

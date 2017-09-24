const DynamoDB = require('aws-sdk/clients/dynamodb');

const dynamoDB = new DynamoDB.DocumentClient();

function handleDynamoResponse(resolve, reject) {
  return (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data.Item);
    }
  };
}

function generatePayload(payload, action) {
  const newPayload = payload;

  if (!('last_updated' in newPayload)) newPayload.last_updated = Date.now();

  Object.keys(newPayload).map(key => newPayload[key] = { // eslint-disable-line
    Value: newPayload[key],
    Action: action,
  });

  return newPayload;
}

class DynamoTable {
  constructor(tableName, username) {
    this.tableName = tableName;
    this.username = username;
  }

  construcKey(field) {
    let fields = field;

    if (fields.constructor !== 'Array') {
      fields = [fields];
    }

    return {
      key: [this.username].concat(fields).join('|'),
    };
  }

  simpleGet(field) {
    const params = {
      TableName: this.tableName,
      Key: this.construcKey(field),
    };

    return new Promise((resolve, reject) => {
      dynamoDB.get(params, handleDynamoResponse(resolve, reject));
    })
      .then((res) => {
        if (!res) throw Error('Not found.');

        const data = res;
        if (data instanceof Object && 'key' in data) delete data.key;

        return data;
      });
  }

  simpleUpdate(field, payload) {
    const params = {
      TableName: this.tableName,
      Key: this.construcKey(field),
      AttributeUpdates: generatePayload(payload, 'PUT'),
    };

    return new Promise((resolve, reject) => {
      dynamoDB.update(params, handleDynamoResponse(resolve, reject));
    });
  }

  addToSet(field, attribute, value) {
    const params = {
      TableName: this.tableName,
      Key: this.construcKey(field),
      UpdateExpression: `ADD ${attribute} :value`,
      ExpressionAttributeValues: { ':value': dynamoDB.createSet([value]) },
    };

    return new Promise((resolve, reject) => {
      dynamoDB.update(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Item);
        }
      });
    });
  }
}

module.exports = {
  DynamoTable,
};

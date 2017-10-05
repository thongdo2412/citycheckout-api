module.exports = {
  db: {
    tables: {
      order: {
        name: process.env.ORDER_TABLE,
        partition: 'key',
        sort: 'date'
      }
    }
  }
}

const AWS = require('aws-sdk')
AWS.config.setPromisesDependency(require('bluebird'))
const awsRegion = process.env.AWS_DEFAULT_REGION || 'us-east-1'
AWS.config.update({region: awsRegion})

module.exports = {
  AWS,
  db: {
    tables: {
      order: {
        name: process.env.ORDER_TABLE,
        partition: 'key',
        sort: 'date'
      }
    }
  },
  funnelNShipping: {
      "checkouts": [
          {
              "id": "001",
              "title": "City Lips - 1 Tube",
              "product": {
                "id": 44739029702,
                "product_id": 10802505670,
                "price": "35.00",
                "sku": "CITYADVCLR-FULL-1x",
              },
              "funnels": [
                {
                  "name": "Funnel_001",
                  "offers": [
                    {
                      "title": "City Lips - 3 Tubes, Add-On Only Offer",
                      "product":
                      {
                        "id": 47992534662,
                        "product_id": 11515426694,
                        "price": "75.00",
                        "sku": "CITYADVCLR-FULL-3x",
                      }
                    },
                    {
                      "title": "City Lips - 1 Tube, Add-On Only Offer",
                      "product":
                      {
                        "id": 47992883142,
                        "product_id": 11515440454,
                        "price": "25.00",
                        "sku": "CITYADVCLR-FULL-1x",
                      }
                    },
                    {
                      "title": "City Lips - 3-Color Combo, Add-On Only Offer - 50% Off",
                      "product":
                      {
                        "id": 48547932358,
                        "product_id": 11553656070,
                        "price": "60.00",
                        "sku": "CITYADVNY-TK-HO-FULL",
                      }
                    },
                  ],
                },
              ]
          },
          {
              "id": "002",
              "title": "City Lips - 2 Tubes",
              "product": {
                "id": 44739121734,
                "product_id": 10802509958,
                "price": "66.00",
                "sku": "CITYADVCLR-FULL-2x",
              },
              "funnels": [
                {
                  "name": "Funnel_002",
                  "offers": [
                    {
                      "title": "City Lips - 4 Tubes, Add-On Only Offer",
                      "product":
                      {
                        "id": 47993623622,
                        "product_id": 11515486790,
                        "price": "100.00",
                        "sku": "CITYADVCLR-FULL-4x",
                      }
                    },
                    {
                      "title": "City Lips - 2 Tubes, Add-On Only Offer",
                      "product":
                      {
                        "id": 47985772166,
                        "product_id": 11515082566,
                        "price": "50.00",
                        "sku": "CITYADVCLR-FULL-2x",
                      }
                    },
                    {
                      "title": "City Lips - 3-Color Combo, Add-On Only Offer - 50% Off",
                      "product":
                      {
                        "id": 48547932358,
                        "product_id": 11553656070,
                        "price": "60.00",
                        "sku": "CITYADVNY-TK-HO-FULL",
                      }
                    },
                  ],

                },
              ]
          },
          {
              "id": "003",
              "title": "City Lips - 3 Tubes",
              "product": {
                "id": 44739281030,
                "product_id": 10802518022,
                "price": "87.00",
                "sku": "CITYADVCLR-FULL-3x",
              },
              "funnels": [
                {
                  "name": "Funnel_003",
                  "offers": [
                    {
                      "title": "City Lips - 6 Tubes, Add-On Only Offer",
                      "product":
                      {
                        "id": 47993684230,
                        "product_id": 11515490758,
                        "price": "150.00",
                        "sku": "CITYADVCLR-FULL-6x",
                      }
                    },
                    {
                      "title": "City Lips - 3 Tubes, Add-On Only Offer",
                      "product":
                      {
                        "id": 47992534662,
                        "product_id": 11515426694,
                        "price": "75.00",
                        "sku": "CITYADVCLR-FULL-3x",
                      }
                    },
                    {
                      "title": "City Lips - 6-Color Combo, Add-On Only Offer - 50% Off",
                      "product":
                      {
                        "id": 48547953862,
                        "product_id": 11546878534,
                        "price": "120.00",
                        "sku": "CITYADVTK-TT-HO-NY-OR-SG-FULL",
                      }
                    },
                  ],
                },
              ]
          },
      ],
      shipRate: {
        "Canada": "9.95",
        "International": "19.95",
        "US": [
          {
            "title": "Standard Shipping (3 - 5 business days)",
            "amount_required": "0.00",
            "rate": "4.95"
          },
          {
            "title": "Free Shipping (3 - 5 business days)",
            "amount_required": "50.00",
            "rate": "0.00"
          },
        ]
      }
  },


}

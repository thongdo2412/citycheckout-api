module.exports = {
  funnelNShipping: {
    "checkouts": [
      {
        "id": "cbl001",
        "pagename": "cbl001",
        "title": "City Lips - 1 Tube",
        "product_id": "689580802054",
        "quantity": 1,
        "discount_amt": 0,
        "price": "35.00",
        "US_funnel": "ccf001"
      },
      {
        "id": "cbl002",
        "pagename": "cbl002",
        "title": "City Lips - 2 Tubes",
        "product_id": "689580802054",
        "quantity": 2,
        "discount_amt": 4,
        "price": "66.00",
        "US_funnel": "ccf001"
      },
      {
        "id": "cbl003",
        "pagename": "cbl003",
        "title": "City Lips - 3 Tubes",
        "product_id": "689580802054",
        "quantity": 3,
        "discount_amt": 18,
        "price": "87.00",        
        "US_funnel": "ccf002",
      },
    ],
    "funnels": [
      {
        "id": "ccf001",
        "name": "City Lips 3 Tubes Upsell",
        "offers": [
          {
            "pagename": "cbloto3us",
            "title": "City Lips - 3 Tubes, Add-On Only Offer",
            "product_id": "689580802054",
            "price": "75.00",
            "quantity": 3,
            "discount_amt": 30,
            "nextpage": "cbloto3ucl",
            "nopage": "cbloto1ds"
          },
          {
            "pagename": "cbloto1ds",
            "title": "City Lips - 1 Tube, Add-On Only Offer",
            "product_id": "689580802054",
            "price": "25.00",
            "quantity": 1,
            "discount_amt": 10,
            "nextpage": "cbloto3ucl",
            "nopage": "cbloto3ucl"
          },
          {
            "pagename": "cbloto3ucl",
            "title": "City Lips - 3-Color Combo, Add-On Only Offer",
            "product_id": "689546330118,689546395654,454651379718",
            "price": "87.00",
            "quantity": 1,
            "discount_amt": 18,
            "nextpage": "cbloto3ucf",
            "nopage": "cbloto1dcl"
          },
          {
            "pagename": "cbloto1dcl",
            "title": "City Lips - Color Tube, Add-On Only Offer",
            "product_id": "780103385094",
            "price": "25.00",
            "quantity": 1,
            "discount_amt": 10,
            "nextpage": "cbloto3ucf",
            "nopage": "cbloto3ucf"
          },
          {
            "pagename": "cbloto3ucf",
            "title": "City Face - 3 Jars, Add-On Only Offer",
            "product_id": "1033300869126",
            "price": "80.40",
            "quantity": 1,
            "discount_amt": 0,
            "nextpage": "orderconfirmation",
            "nopage": "cbloto1dcf"
          },
          {
            "pagename": "cbloto1dcf",
            "title": "City Face - 1 Jar, Add-On Only Offer",
            "product_id": "1033294118918",
            "price": "35.50",
            "quantity": 1,
            "discount_amt": 0,
            "nextpage": "orderconfirmation",
            "nopage": "orderconfirmation"
          }
        ],
      },
      {
        "id": "ccf002",
        "name": "City Lips 6 Tubes Upsell",
        "offers": [
          {
            "id": "",
            "pagename": "cbloto6us",
            "title": "City Lips - 6 Tubes, Add-On Only Offer",
            "product_id": "689580802054",
            "price": "150.00",
            "quantity": 6,
            "discount_amt": 60,
            "nextpage": "cbloto3ucl",
            "nopage": "cbloto3ds"
          },
          {
            "pagename": "cbloto3ds",
            "title": "City Lips - 3 Tubes, Add-On Only Offer",
            "product_id": "689580802054",
            "price": "75.00",
            "quantity": 3,
            "discount_amt": 30,
            "nextpage": "cbloto3ucl",
            "nopage": "cbloto3ucl"
          },
          {
            "pagename": "cbloto3ucl",
            "title": "City Lips - 3-Color Combo, Add-On Only Offer",
            "product_id": "689546330118,689546395654,454651379718",
            "price": "87.00",
            "quantity": 1,
            "discount_amt": 18,
            "nextpage": "cbloto3ucf",
            "nopage": "cbloto1dcl"
          },
          {
            "pagename": "cbloto1dcl",
            "title": "City Lips - Color Tube, Add-On Only Offer",
            "product_id": "780103385094",
            "price": "25.00",
            "quantity": 1,
            "discount_amt": 10,
            "nextpage": "cbloto3ucf",
            "nopage": "cbloto3ucf"
          },
          {
            "pagename": "cbloto3ucf",
            "title": "City Face - 3 Jars, Add-On Only Offer",
            "product_id": "1033300869126",
            "price": "80.40",
            "quantity": 1,
            "discount_amt": 0,
            "nextpage": "orderconfirmation",
            "nopage": "cbloto1dcf"
          },
          {
            "pagename": "cbloto1dcf",
            "title": "City Face - 1 Jar, Add-On Only Offer",
            "product_id": "1033294118918",
            "price": "35.50",
            "quantity": 1,
            "discount_amt": 0,
            "nextpage": "orderconfirmation",
            "nopage": "orderconfirmation"
          }
        ],
      },
    ],
    "ship_rate": {
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

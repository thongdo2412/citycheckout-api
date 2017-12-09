module.exports = {
  funnelNShipping: {
    "checkouts": [
      {
        "id": "cbl001",
        "pagename": "cbl001",
        "title": "City Lips - 1 Tube",
        "product_id": 454957826054,
        "price": "35.00",
        "US_funnel": "ccf001"
      },
      {
        "id": "cbl002",
        "pagename": "cbl002",
        "title": "City Lips - 2 Tubes",
        "product_id": 454963036166,
        "price": "66.00",
        "US_funnel": "ccf001"
      },
      {
        "id": "cbl003",
        "pagename": "cbl003",
        "title": "City Lips - 3 Tubes",
        "product_id": 454970212358,
        "price": "87.00",        
        "US_funnel": "ccf002",
      },
    ],
    "funnels": [
      {
        "id": "ccf001",
        "name": "City Lips 3 Tubes Upsale",
        "offers": [
          {
            "id": "",
            "pagename": "cbloto3us",
            "title": "City Lips - 3 Tubes, Add-On Only Offer",
            "product_id": 454997409798,
            "price": "75.00",
            "nextpage": "cbloto3ucl",
            "nopage": "cbloto1ds"
          },
          {
            "pagename": "cbloto1ds",
            "title": "City Lips - 1 Tube, Add-On Only Offer",
            "product_id": 455012777990,
            "price": "25.00",
            "nextpage": "cbloto3ucl",
            "nopage": "cbloto3ucl"
          },
          {
            "pagename": "cbloto3ucl",
            "title": "City Lips - 3-Color Combo, Add-On Only Offer - 50% Off",
            "product_id": 455036207110,
            "price": "60.00",
            "nextpage": "orderconfirmation",
            "nopage": "orderconfirmation"
          },
        ],
      },
      {
        "id": "ccf002",
        "name": "City Lips 6 Tubes Upsale",
        "offers": [
          {
            "id": "",
            "pagename": "cbloto6us",
            "title": "City Lips - 6 Tubes, Add-On Only Offer",
            "product_id": 47993684230,
            "price": "150.00",
            "nextpage": "cbloto6ucl",
            "nopage": "cbloto3ds"
          },
          {
            "pagename": "cbloto3ds",
            "title": "City Lips - 3 Tubes, Add-On Only Offer",
            "product_id": 454997409798,
            "price": "75.00",
            "nextpage": "cbloto6ucl",
            "nopage": "cbloto6ucl"
          },
          {
            "pagename": "cbloto6ucl",
            "title": "City Lips - 6-Color Combo, Add-On Only Offer - 50% Off",
            "product_id": 455051411462,
            "price": "120.00",
            "nextpage": "orderconfirmation",
            "nopage": "orderconfirmation"
          },
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

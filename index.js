const express = require('express');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUxBtlmVB4ogSLsP-6lNZlxjE3ZGbiHi-HMJtd4WmGxYrHwB7G9oGNEYU8MFevZ2LSoFODBLEFjfAb8V',
  'client_secret': 'EMw-GZACIydjUu-xcC9DAyJvpxEla-C4LH9qcp67WbPmFp-48WC08q9RQhKOBd3OLMLbgTAjxIfYLL1k'
});

const app = express();

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

app.listen(process.env.PORT || 5000)
console.log(`Server Started on`);

app.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Perceptual-Hashing",
                  "sku": "001",
                  "price": "10.99",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "10.99"
          },
          "description": "Perceptual-Hashing"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });

  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "10.99"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
  });

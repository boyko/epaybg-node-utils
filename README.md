# Node.js functions for epay.bg

[![Build Status](https://travis-ci.org/boyko/epaybg-node-utils.svg?branch=master)](https://travis-ci.org/boyko/epaybg-node-utils)

A small library for parsing payment status messages and for creating payment requests with [epay.bg](https://epay.bg).
## Installation
```sh
// npm
npm install epaybg-node-utils --save

// yarn
yarn add epaybg-node-utils
```

## Create a payment request

```js
const {createPaymentRequest} = require('epaybg-node-utils');

const secret = 'my-epay-secret';
const data = {
  min: 'some-merchant-id',
  amount: '32.30',
  exp_time: '201902011230',
  currency: 'BGN',
  invoice: '0001',
};

createPaymentRequest(data, secret);
```

## Parse a payment status message

```js
const {parsePayload} = require('epaybg-node-utils');

const paymentStatusMessage = `INVOICE=11:STATUS=PAID:PAY_TIME=201806021230:STAN=123456:BCODE=123456\n
INVOICE=12:STATUS=DENIED\n
INVOICE=13:STATUS=EXPIRED`

parsePayload(paymentStatusMessage);
```



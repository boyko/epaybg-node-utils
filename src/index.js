// @flow

import crypto from 'crypto';
import querystring from 'querystring';

export const encode = data => new Buffer(data).toString('base64');

export const decode = base64data => Buffer.from(base64data, 'base64').toString();

export const checksum = (data, secret) =>
  crypto.createHmac('sha1', secret).update(data).digest('hex');

export const parsePayload = (payload) => {
  const lines = payload.split('\n').map(line => {
    if (line === '') return null;
    return querystring.parse(line, ':');
  });
  const nonEmptyLines = lines.filter(line => line !== null);
  return nonEmptyLines;
};

export const createDataString = (input) => {
  const { min, amount, currency, invoice, exp_time, descr } = input;
  return `MIN=${min}
INVOICE=${invoice}
AMOUNT=${amount}
CURRENCY=${currency || 'BGN'}
EXP_TIME=${exp_time}
DESCR=${descr}
ENCODING=utf-8`;
};

import { expect } from 'chai';

import {
  calculateChecksum,
  createDataString,
  createPaymentRequestData,
  decode,
  encode,
  parseMessage,
  validate
} from '../src';

describe('epaybg node utils', () => {
  describe('encode', () => {
    it('should convert a string to a base64 encoded buffer', () => {
      const result = encode('123');
      expect(result).to.equal('MTIz');
    });
  });
  describe('decode', () => {
    it('should convert a base64 encoded buffer to a string', () => {
      const data = encode('123');
      expect(decode(data)).to.equal('123');
    });
  });
  describe('calculateChecksum', () => {
    it('should throw if data is not specified', () => {
      // @ts-ignore
      expect(() => calculateChecksum()).to.throw('Data and secret must be provided.');
    });
    it('should throw if secret is not specified', () => {
      // @ts-ignore
      expect(() => calculateChecksum('1234')).to.throw('Data and secret must be provided.');
    });
    it('should calculate the sha1 digest using secret', () => {
      const result = calculateChecksum('test-message', 'some-secret');
      expect(result).to.equal('33ca6a84fc0b06a9506b79147faad49b53149657');
    });
  });
  describe('validate', () => {
    it('should throw if secret is missing', () => {
      // @ts-ignore
      expect(() => validate({ encoded: '123', checksum: '4dsfs' })).to.throw('Missing epay secret.');
    });
    it('should return false if message is missing', () => {
      // @ts-ignore
      expect(validate(undefined, 'secret')).to.equal(false);
    });
    it('should return true if the message is valid', () => {
      const encoded = encode('123');
      const checksum = calculateChecksum(encoded, 'secret');
      expect(validate({ encoded, checksum }, 'secret')).to.equal(true);
    });
    it('should return false if the message is invalid', () => {
      expect(validate({ encoded: '1234', checksum: '123' }, 'secret')).to.equal(false);
    });
  });
  describe('parseMessage', () => {
    it('should return an array', () => {
      const data =
        `INVOICE=11:STATUS=PAID:PAY_TIME=201806021230:STAN=123456:BCODE=123456\n
        INVOICE=12:STATUS=DENIED\n
        INVOICE=13:STATUS=EXPIRED`;

      const message = {
        encoded: encode(data),
        checksum: calculateChecksum(data, 'secret')
      };

      const expected = [
        {
          INVOICE: '11',
          STATUS: 'PAID',
          PAY_TIME: '201806021230',
          STAN: '123456',
          BCODE: '123456'
        },
        {
          INVOICE: '12',
          STATUS: 'DENIED'
        },
        {
          INVOICE: '13',
          STATUS: 'EXPIRED'
        }
      ];

      const result = parseMessage(message);
      expect(result).to.deep.equal(expected);
    });
  });
  describe('createDataString', () => {
    it('should throw if called without an argument', () => {
      // @ts-ignore
      expect(() => createDataString()).to.throw();
    });
    it('should throw if required arguments are missing', () => {
      // @ts-ignore
      expect(() => createDataString({ min: '123' })).to.throw('Missing required arguments.');
    });
    it('should return a string', () => {
      const data = {
        min: '1234',
        amount: '33.23',
        currency: 'BGN',
        invoice: '00001',
        exp_time: '01.08.2020 23:15:30',
        descr: 'some-description',
        encoding: 'utf-8'
      };
      // @ts-ignore
      const result = createDataString(data);
      expect(result).to.equal('MIN=1234\nINVOICE=00001\nAMOUNT=33.23\nCURRENCY=BGN\nEXP_TIME=01.08.2020 23:15:30\nDESCR=some-description\nENCODING=utf-8');
    });
    it('should use utf-8 encoding by default', () => {
      const data = {
        min: '1234',
        amount: '33.23',
        currency: 'BGN',
        invoice: '00001',
        exp_time: '01.08.2020 23:15:30',
        descr: 'some-description'
      };
      // @ts-ignore
      const result = createDataString(data);
      expect(result).to.equal('MIN=1234\nINVOICE=00001\nAMOUNT=33.23\nCURRENCY=BGN\nEXP_TIME=01.08.2020 23:15:30\nDESCR=some-description\nENCODING=utf-8');
    });
  });
  describe('createPaymentRequestData', () => {
    it('should return an object with encoded and checksum properties', () => {
      const data = {
        min: '1234',
        amount: '33.23',
        currency: 'BGN',
        invoice: '00001',
        exp_time: '01.08.2020 23:15:30',
        descr: 'some-description'
      };
      const result = createPaymentRequestData(data, 'some-secret');
      expect(result).to.deep.equal({
        min: '1234',
        amount: '33.23',
        currency: 'BGN',
        invoice: '00001',
        exp_time: '01.08.2020 23:15:30',
        descr: 'some-description',
        encoded: 'TUlOPTEyMzQKSU5WT0lDRT0wMDAwMQpBTU9VTlQ9MzMuMjMKQ1VSUkVOQ1k9QkdOCkVYUF9USU1FPTAxLjA4LjIwMjAgMjM6MTU6MzAKREVTQ1I9c29tZS1kZXNjcmlwdGlvbgpFTkNPRElORz11dGYtOA==',
        checksum: '9d09db1b61bfd7947ed390d6464ca7953d0bf3f2'
      });
    });
  });
});

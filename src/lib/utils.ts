import crypto from 'crypto';
import { trim } from 'lodash';
import querystring from 'querystring';

export const encode = (data: string): string => {
  return new Buffer(data).toString('base64');
};

export const decode = (base64data: string): string => Buffer.from(base64data, 'base64').toString();

/**
 * Calculates the sha1 digest for a string using secret.
 *
 * @param data
 * @param secret
 */
export const calculateChecksum = (data: string, secret: string): string => {
  if (!data || !secret) {
    throw new Error('Data and secret must be provided.');
  }
  return crypto
    .createHmac('sha1', secret)
    .update(data)
    .digest('hex');
};

interface EpayMessage {
  encoded: string,
  checksum: string,
}

export const validate = (message: EpayMessage, secret: string): boolean => {
  if (!secret) {
    throw new Error('Missing epay secret.');
  }
  if (!message || !message.encoded) {
    return false;
  }

  const { encoded, checksum } = message;
  // TODO: validate checksum
  if (calculateChecksum(encoded, secret) !== checksum) {
    // console.log('==== Checksum not matching, rejecting... ====');
    return false;
  }

  return true;
};

export interface BaseEvent {
  INVOICE: string,
  STATUS: 'PAID' | 'DENIED' | 'EXPIRED',
}

export interface SuccessEvent extends BaseEvent {
  STATUS: 'PAID',
  AMOUNT: string,
  PAY_TIME: string,
  STAN: string,
  BCODE: string,
  BIN?: string,
}

export interface ErrorEvent extends BaseEvent {
  STATUS: 'DENIED' | 'EXPIRED'
}

export type EpayEvent = SuccessEvent | ErrorEvent


export const parseMessage = (payload: EpayMessage): ReadonlyArray<EpayEvent> => {
  const { encoded } = payload;
  const data = decode(encoded);

  const lines: EpayEvent[] = [];
  data.split('\n').forEach((lineString: string) => {
    if (!lineString || trim(lineString) === '') {
      return;
    }
    const line = querystring.parse(trim(lineString), ':');
    // @ts-ignore
    lines.push(line);
  });
  return lines;
};

// TODO: refactor?
interface EpayData {
  min: string,
  amount: string,
  currency: string,
  invoice: string,
  exp_time: string,
  descr?: string,
  encoding?: 'utf-8' | 'CP1251'
}

// CP1251
// EXP_TIME=DD.MM.YYYY[ hh:mm[:ss]]
// EXP_TIME=01.08.2020 EXP_TIME=01.08.2020 23:15    (може да се подаде и с час:мин)
// EXP_TIME=01.08.2020 23:15:30 (може да се подаде и с час:мин:сек)

/**
 * Create a string from payment request data.
 *
 * @param input
 */
export const createDataString = (input: EpayData): string => {
  const {
    min,
    amount,
    currency,
    invoice,
    exp_time,
    descr = '',
    encoding = 'utf-8'
  } = input;

  if (!min || !amount || !currency || !invoice || !exp_time) {
    throw new Error('Missing required arguments.');
  }

  return `MIN=${min}
INVOICE=${invoice}
AMOUNT=${amount}
CURRENCY=${currency}
EXP_TIME=${exp_time}
DESCR=${descr}
ENCODING=${encoding}`;
};

interface SignedEpayData extends EpayData {
  encoded: string,
  checksum: string,
}

/**
 * Creates a payment request data.
 *
 * @param data
 * @param secret
 */
export const createPaymentRequestData = (data: EpayData, secret: string): SignedEpayData => {
  const dataString = createDataString(data);
  const encoded = encode(dataString);
  const checksum = calculateChecksum(encoded, secret);

  return {
    ...data,
    encoded,
    checksum
  };
};

// @flow

export type DataInput = {
  min: string, // Merchant ID
  amount: number,
  currency: ?string,
  invoice: string,
  exp_time: string,
  descr: string,
}

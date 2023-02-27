export interface PaymentLog {
  address: string;
  artTokenId: number;
  paymentIntentId: string;
  status: 'pending' | 'succeed' | 'failed' | 'canceled';
  amountInUsd: number;
  txId?: string;
  createdAt: Date;
  updatedAt: Date;
}

import { TransactionObject, tx } from '@onflow/fcl';

/**
 * Wait until the transaction confirms
 * @param txId
 */
export async function waitForTx(txId: string): Promise<TransactionObject> {
  return new Promise((resolve, reject) => {
    tx(txId).subscribe((txStatus: TransactionObject) => {
      if (txStatus.status === 4) {
        resolve(txStatus);
      } else if (txStatus.status === 5) {
        reject(new Error(txStatus.errorMessage));
      }
    });
  });
}

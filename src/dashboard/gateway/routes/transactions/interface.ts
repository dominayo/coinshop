/* eslint-disable @typescript-eslint/no-empty-interface */
import { ISkipLimit } from '../../../../common/interface';

export interface ITransactionList extends ISkipLimit {}

export interface ITransactionVerdict {
	transactionId: string;
	verdict: boolean;
}

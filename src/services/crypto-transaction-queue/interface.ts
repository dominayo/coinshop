import { Document } from 'mongoose';
import { CryptoCurrency, WalletQueueStatus, ICreatedUpdated } from '../../common/interface';

export interface ICryptoTransactionsQueue {
	block: string;
	userId: string;
	wallet: string;
	amount: number;
	cryptoCurrency: CryptoCurrency;
	status: WalletQueueStatus;
}

export interface ICreate {
	block: string;
	userId: string;
	wallet: string;
	amount: number;
	cryptoCurrency: CryptoCurrency;
}

export interface IDocument extends ICryptoTransactionsQueue, ICreatedUpdated, Document {}

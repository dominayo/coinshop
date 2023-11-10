import { Document } from 'mongoose';
import { CryptoCurrency, ICreatedUpdated } from '../../common/interface';

export interface IUserTransactions {
	userId: string;
	transactions: string[],
	cryptoCurrency: CryptoCurrency;
	block: string;
}

export interface ICreate {
	userId: string;
	transactions: string[],
	cryptoCurrency: CryptoCurrency;
}

export interface IUpdate {
	userId: string;
	transaction: string,
	cryptoCurrency: CryptoCurrency;
}

export interface IFindUsersTransactions {
	userId: string;
	cryptoCurrency: CryptoCurrency;
}

export interface IDocument extends IUserTransactions, Document, ICreatedUpdated {}

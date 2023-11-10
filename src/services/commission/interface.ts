import { CryptoCurrency, ICreatedUpdated } from '../../common/interface';
import { Document } from 'mongoose';

export interface ICommission {
	cryptoCurrency: CryptoCurrency;
	commission: number;
}

export interface ICreate {
	cryptoCurrency: CryptoCurrency;
	commission: number;
}

export interface IUpdate {
	commission: number;
	cryptoCurrency: CryptoCurrency;
}

export interface IFindOne {
	cryptoCurrency: CryptoCurrency;
}

export interface IIsExists {
	cryptoCurrency: CryptoCurrency;
}

export interface ICalculateAmountWithCommission {
	amount: number;
	cryptoCurrency: CryptoCurrency;
	commission: number;
}

export interface ICalculateAmountFromCommission {
	amount: number;
	cryptoCurrency: CryptoCurrency;
	commission: number;
}

export interface IDocument extends ICommission, ICreatedUpdated, Document {}

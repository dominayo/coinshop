import { Document } from 'mongoose';
import { ICreatedUpdated, CryptoCurrency } from '../../common/interface';

/* eslint-disable no-unused-vars */
// export enum ExchangeType {
// 	Buy = 'Buy',
// 	Sell = 'Sell',
// }

export interface ICryptoCurrency {
	currencyType: CryptoCurrency,
	exchangeRate: number
}

export interface ICryptoCurrencyCreate {
	currencyType: CryptoCurrency,
	exchangeRate: number
}

export interface ICryptoCurrencyUpdate {
	id: string;
	currencyType: CryptoCurrency,
	exchangeRate: number
}

export interface ICryptoCurrencyFindOneAndUpdate {
	currencyType: CryptoCurrency,
	exchangeRate: number
}

export interface IFindOne {
	currencyType: CryptoCurrency;
}

export interface IDocument extends ICryptoCurrency, ICreatedUpdated, Document {}

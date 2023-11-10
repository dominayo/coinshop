import { Document } from 'mongoose';
import { CryptoCurrency, ICreatedUpdated } from '../../common/interface';

export interface ICryptoWallets {
	cryptoCurrency: CryptoCurrency;
	wallet: string
	isBooked: boolean;
}

export interface IParseWallets {
	cryptoCurrency: CryptoCurrency;
	text: string;
}

export interface ICreateMany {
	cryptoCurrency: CryptoCurrency;
	wallet: string;
}

export interface IGetFreeWalletAndBookParams {
	cryptoCurrency: CryptoCurrency;
}

export interface IDocument extends ICryptoWallets, ICreatedUpdated, Document {}

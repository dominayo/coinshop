/* eslint-disable no-unused-vars */
import { Document } from 'mongoose';
import { CryptoCurrency, ExchangeType, ICreatedUpdated } from '../../common/interface';

export interface IWallet {
	userId: string;
	cryptoCurrency: CryptoCurrency,
	amount: number,
	hold: number;
	wallet: string;
}

export interface IWalletCreate {
	userId: string;
	cryptoCurrency: CryptoCurrency,
	amount: number;
	wallet: string;
}

export interface IWalletInsertMany extends ICreatedUpdated {
	userId: string;
	cryptoCurrency: CryptoCurrency,
	amount: number;
	hold: number;
	wallet: string;
}

export interface IWalletDeposit {
	userId: string;
	id: string;
	amount: number;
	isInner?: boolean;
}

export interface IWalletWithdraw {
	userId: string;
	id: string;
	amount: number;
	to?: string;
	isInner?: boolean;
	isTron?: boolean;
}

export interface ITransfer {
	owner: string;
	customerId: string;
	cryptoCurrency: CryptoCurrency;
	amount: number;
	type: ExchangeType;
	commission: number;
	advertId: string;
}

export interface IUserWallets {
	userId;
}

export interface IFindById {
	id: string;
}

export interface IIsExists {
	id: string;
}

export interface IIsOwner {
	id: string;
	userId: string;
}

export interface IIsAmount {
	id: string;
	amount: number;
}

export interface IIsAmountForCreateDealWithBuyType {
	id: string;
	amount: number;
}

export interface isAmountForWidthraw {
	id: string;
	amount: number;
}

export interface IFind {
	userId: string;
	cryptoCurrency: CryptoCurrency;
}

export interface IHold {
	userId: string;
	cryptoCurrency: CryptoCurrency;
	hold: number;
}

export interface IUnhold {
	unhold: number;
	userId: string;
	cryptoCurrency: CryptoCurrency;
}

export interface IFindUsersWallets {
	userId: string;
}

export interface IIncomingCryptoWallet {
	to: string;
	value: string;
}

export interface IListByCryptoCurrency {
	cryptoCurrency: CryptoCurrency;
}

export interface IListByCryptoCurrencies {
	cryptoCurrencies: CryptoCurrency[];
}

export interface IFindByWallet {
	cryptoCurrency: CryptoCurrency;
	wallet: string;
}

export interface IUpdateAmount {
	id: string;
	newAmount: number;
}

export interface IIsAmountForUpdate {
	commission: number;
	walletId: string;
	newMaxLimit: number;
	oldMaxLimit: number;
	type: ExchangeType;
}

export interface IIsAmountForActivate {
	commission: number;
	walletId: string;
	maxLimit: number;
	type: ExchangeType;
}

export interface IDocument extends IWallet, ICreatedUpdated, Document {}

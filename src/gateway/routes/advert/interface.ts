/* eslint-disable no-unused-vars */
import { ExchangeType } from '../../../common/interface';
export enum CryptoCurrency {
	BTC = 'BTC',
	ETH = 'ETH',
	USDT = 'USDT'
}

export enum Direction {
	SberBank = 'Сбербанк',
	Qiwi = 'Qiwi',
	Tinkoff = 'Тинькоф',
}

export interface IAdvertCreate {
	owner: string
	type: ExchangeType;
	cryptoCurrency: CryptoCurrency;
	direction: Direction;
	isFixedRate: boolean;
	exchangeRate: number;
	spread?: number;
	minLimit: number;
	maxLimit: number;
	comments: string;
}

export interface IAdvertUpdate {
	id: string;
	exchangeRate?: number;
	isFixedRate: boolean;
	spread?: number;
	minLimit?: number;
	maxLimit?: number;
	comments?: string;
}

export interface IAdvertDelete {
	id: string;
}

export interface IAdvertGet {
	id: string;
}

export interface IIsOwner {
	userId: string;
	advertId: string;
}

export interface IIsDealOpen {
	advertId: string;
}

export interface IIsMaxBiggerThenMinLimit {
	minLimit: number;
	maxLimit: number;
}

export interface IDiactivate {
	id: string;
}

export interface IActivate {
	id: string;
}

export interface IIsStatusNotMatch {
	id: string;
}

export interface IIsDeactivated {
	id: string;
}

export interface IIsExists {
	id: string;
}

export interface IAdvertList {
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
	skip?: string;
	limit?: string;
}

export interface IUserListParams {
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
	skip?: string;
	limit?: string;
}

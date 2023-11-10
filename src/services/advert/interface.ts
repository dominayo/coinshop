import { Document } from 'mongoose';
import { ExchangeType, CryptoCurrency, Direction, ICreatedUpdated } from '../../common/interface';

export interface IAdvert {
	owner: string;
	type: ExchangeType;
	cryptoCurrency: CryptoCurrency;
	direction: Direction;
	isFixedRate: boolean;
	exchangeRate: number;
	spread: number;
	minLimit: number;
	maxLimit: number;
	comments?: string;
	commission: number;
	isActive: boolean;
	newExchangeRate?: number;
}

export interface IAdvertCreate {
	owner: string;
	type: ExchangeType;
	cryptoCurrency: CryptoCurrency;
	direction: Direction;
	isFixedRate: boolean;
	exchangeRate: number;
	spread?: number;
	minLimit: number;
	maxLimit: number;
	comments: string;
	newExchangeRate?: number;
}

export interface IAdvertUpdate {
	id: string;
	isFixedRate?: boolean;
	exchangeRate?: number;
	spread?: number;
	minLimit?: number;
	maxLimit?: number;
	comments?: string;
	isActive?: boolean;
}

export interface IAdvertFixedUpdate {
	id: string;
	exchangeRate?: number;
	minLimit?: number;
	maxLimit?: number;
	comments?: string;
}

export interface IAdvertFloatUpdate {
	id: string;
	cryptoCurrency: CryptoCurrency;
	exchangeRate?: number;
	spread?: number;
	minLimit?: number;
	maxLimit?: number;
	comments?: string;
}

export interface IAdvertList {
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
	skip?: number;
	limit?: number;
}

export interface IAdvertActiveList {
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
	skip?: number;
	limit?: number;
}

export interface IListByIds {
	advertIds: string[];
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
	skip?: number;
	limit?: number;
}

export interface IAdvertDelete {
	id: string;
}

export interface IAdvertFindById {
	id: string;
}

export interface IIsExists {
	id: string;
}

export interface IIsNotOwner {
	advertId: string;
	userId: string;
}

export interface IDeactivate {
	id: string;
}

export interface IActivate {
	id: string;
}

export interface IAdvertUpdateMaxLimit {
	id: string;
	soldAmount: number;
}

export interface IIsMaxLimitEqualZero {
	id: string;
	maxLimit: number;
}

export interface IUpdateMany {
	cryptoCurrency: CryptoCurrency;
	exchangeRate: number;
}

export interface IIsActive {
	id: string;
}

export interface ICountByOwnerId {
	owner: string;
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
}

export interface IAdvertListCount {
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
}

export interface IActiveAdvertListCount {
	type?: ExchangeType;
	cryptoCurrency?: CryptoCurrency;
	direction?: Direction;
	isFixedRate?: boolean;
}

export interface IAddMaxLimit {
	id: string;
	amount: number;
}

export interface IDocument extends IAdvert, ICreatedUpdated, Document {}

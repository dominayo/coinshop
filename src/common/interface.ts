/* eslint-disable no-unused-vars */

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

export enum ExchangeType {
	Buy = 'BUY',
	Sell = 'SELL'
}

export enum UserRoles {
	Admin = 'ADMIN',
	Client = 'CLIENT',
	Support = 'SUPPORT'
}

export enum WalletQueueStatus {
	Progress = 'PROGRESS',
	Aproved = 'APROVED',
	Canceled = 'CANCELED'
}

export interface ICreatedUpdated {
	createdAt: Date;
	updatedAt: Date;
}

export interface IWebsocketError {
	error: string;
}

export interface ISkipLimit {
	skip?: string;
	limit?: string;
}

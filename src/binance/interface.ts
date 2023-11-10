/* eslint-disable no-unused-vars */
export enum Direction {
	ETHBTC = 'ETHBTC',
	BTCUSDT = 'BTCUSDT'

}

export enum Ratio {
	BTC = 'BTC',
	USD = 'USD',
	RUR = 'RUR'
}

export enum CryptoCurrency {
	BTC = 'BTC',
	ETH = 'ETH',
	USDT = 'USDT'
}

export interface ICryptoCurrency {
	symbol: string;
	price: number;
}

export interface IBinance {
	data: ICryptoCurrency[];
}

export interface ICurrency {
	ccy: Ratio;
	// eslint-disable-next-line camelcase
	base_ccy: Ratio;
	buy: number;
	sell: number;
}

export interface IPrivatRatio {
	data: ICurrency[];
}

export interface ICurrencyPrices {
	currencyType: CryptoCurrency;
	exchangeRate: number;
}

export interface IPrivatePrices {
	BTCUSD: ICurrency;
	USDUAH: ICurrency;
	RURUAH: ICurrency;
}

export interface IIsAmountBiggerThenFrontier {
	amount: number;
	cryptoCurrency: CryptoCurrency;
}


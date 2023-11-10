/* eslint-disable camelcase */
import { Ratio } from '../../binance/interface';
import { Document } from 'mongoose';
import { ICreatedUpdated } from '../../common/interface';

export interface IFiatCurrency {
	ccy: Ratio
	base_ccy: Ratio
	buy: number,
	sell: number
}

export interface IUpsert {
	ccy: Ratio
	base_ccy: Ratio
	buy: number,
	sell: number
}

export interface IDocument extends IFiatCurrency, ICreatedUpdated, Document {}

import { model } from 'mongoose';
import { IFiatCurrency, IDocument } from './interface';
import FiatCurrencySchema from './schema';

const Model = model<IDocument>(
	'FiatCurrency', FiatCurrencySchema, 'fiat-currencies'
);

export class FiatCurrency extends Model implements IFiatCurrency {}

import { model } from 'mongoose';
import { ICryptoCurrency, IDocument } from './interface';
import CryptoCurrencySchema from './schema';

const Model = model<IDocument>(
	'CryptoCurrency', CryptoCurrencySchema, 'crypto-currencies'
);

export class CryptoCurrency extends Model implements ICryptoCurrency {}

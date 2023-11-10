import { model } from 'mongoose';
import { ICryptoTranssaction, IDocument } from './interface';
import CryptoTransactionSchema from './schema';

const Model = model<IDocument>(
	'CryptoTransaction', CryptoTransactionSchema, 'crypto-transactions'
);

export class CryptoTransaction extends Model implements ICryptoTranssaction {}

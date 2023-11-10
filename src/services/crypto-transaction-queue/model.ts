import { model } from 'mongoose';
import { ICryptoTransactionsQueue, IDocument } from './interface';
import CryptoTransactionQueueSchema from './schema';

const Model = model<IDocument>(
	'CryptoTransactionQueue', CryptoTransactionQueueSchema, 'crypto-transactions-queue'
);

export class CryptoTransactionQueue extends Model implements ICryptoTransactionsQueue {}

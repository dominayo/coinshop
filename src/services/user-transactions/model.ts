import { model } from 'mongoose';
import { IUserTransactions, IDocument } from './interface';
import UserTransactionsSchema from './schema';

const Model = model<IDocument>(
	'UserTransaction', UserTransactionsSchema, 'user-transactions'
);

export class UserTransactions extends Model implements IUserTransactions {}

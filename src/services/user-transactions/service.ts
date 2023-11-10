import { ICreate, IUpdate, IFindUsersTransactions, IDocument } from './interface';
import { UserTransactions } from './model';

export class UserTransactionsService {
	async create(params: ICreate): Promise<IDocument> {
		return await UserTransactions.create(params);
	}

	async upsertUserTransactions(params: IUpdate): Promise<IDocument> {
		const { userId, cryptoCurrency, transaction } = params;

		return await UserTransactions.findOneAndUpdate(
			{ userId, cryptoCurrency }, { $push: { transactions: transaction } }, { upsert: true }).exec();
	}

	async findUsersTransactions(params: IFindUsersTransactions): Promise<IDocument> {
		return await UserTransactions.findOne(params).exec();
	}
}

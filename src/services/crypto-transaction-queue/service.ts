import { ICreate, IDocument } from './interface';
import { CryptoTransactionQueue } from './model';

export class CryptoTransactionsQueueService {
	async create(params: ICreate): Promise<IDocument> {
		return await CryptoTransactionQueue.create(params);
	}
}

import { CryptoTransaction } from './model';
import { ICryptoTransactionCreate, ICryptoTranssactionUpdate, ICyptoTransactionList, IUserList, IFindById,
	ICountByUserId, IDocument, TransactionType, IGetUserSummOfSuccessTransactions, Status, IListByStatus,
	IProcessingCyptoTransactionList } from './interface';
import { WalletService } from '../wallet/service';

export class CryptoTransactionService {
	async create(params: ICryptoTransactionCreate): Promise<IDocument> {
		const { userId, cryptoCurrency } = params;
		const walletService = new WalletService();
		const [{ wallet }] = await (await walletService.findUserWallets({ userId }))
			.filter((walletDoc) => {
				if (walletDoc.cryptoCurrency === cryptoCurrency) {
					return walletDoc.wallet;
				}
			});

		const doc = await CryptoTransaction.create({ ...params, wallet });

		return doc as IDocument;
	}

	async update(params: ICryptoTranssactionUpdate): Promise<IDocument> {
		const { id, status } = params;
		const doc = await CryptoTransaction.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();

		return doc;
	}

	async findById(params: IFindById): Promise<IDocument> {
		const { id } = params;

		return await CryptoTransaction.findById({ _id: id }).exec();
	}

	async listByStatus(params: IListByStatus): Promise<IDocument[]> {
		return await CryptoTransaction.find(params).exec();
	}

	async getUserSummOfSuccessTransactions(params: IGetUserSummOfSuccessTransactions): Promise<number> {
		const { userId, cryptoCurrency } = params;

		const docs = await CryptoTransaction.find(
			{ userId, cryptoCurrency, status: Status.Success,
				transactionType: { $in: [TransactionType.Deposit, TransactionType.Withdraw] }, isInner: { $ne: false } });

		let summ = 0;

		if (docs) {
			for (const doc of docs) {
				summ = summ + Number(doc.amount);
			}
		}

		return summ;
	}

	async list(params: ICyptoTransactionList): Promise<IDocument[]> {
		const { skip, limit, ...rest } = params;

		const filter = Object.values(rest).filter((item) => item !== null);

		let docs = [];

		if (filter.length > 0) {
			docs = await CryptoTransaction.find(rest).skip(skip).limit(limit).exec();
		} else {
			docs = await CryptoTransaction.find({}).skip(skip).limit(limit).exec();
		}

		return docs as IDocument[];
	}

	async listProcessing(params: IProcessingCyptoTransactionList): Promise<IDocument[]> {
		const { skip, limit, ...rest } = params;

		const filter = Object.values(rest).filter((item) => item !== null);

		let docs = [];

		if (filter.length > 0) {
			docs = await CryptoTransaction.find({ ...rest, status: Status.Processing }).skip(skip).limit(limit).exec();
		} else {
			docs = await CryptoTransaction.find({ status: Status.Processing }).skip(skip).limit(limit).exec();
		}

		return docs as IDocument[];
	}

	async count(): Promise<number> {
		return await CryptoTransaction.find({}).countDocuments().exec();
	}

	async countProcessing(): Promise<number> {
		const docs = await CryptoTransaction.find({ status: Status.Processing }).countDocuments().exec();

		return docs;
	}

	async findUserList(params: IUserList): Promise<IDocument[]> {
		const { userId, skip, limit, ...rest } = params;

		const filter = Object.values(rest).filter((item) => item !== null);

		let docs = [];

		if (filter.length > 0) {
			docs = await CryptoTransaction.find({ $or: [{ userId, ...rest  },
				{ recipientId: userId, transactionType: TransactionType.Transfer, ...rest }]})
				.sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
		} else {
			docs = await CryptoTransaction.find(
				{ $or: [{ userId }, { recipientId: userId, transactionType: TransactionType.Transfer }] })
				.sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
		}

		return docs;
	}

	async countByUserId(params: ICountByUserId): Promise<number> {
		const { userId, skip, limit, ...rest } = params;

		const filter = Object.values(rest).filter((item) => item !== null);
		let count = 0;

		if (filter.length > 0) {
			count = await CryptoTransaction.find({ $or: [{ userId, ...rest  },
				{ recipientId: userId, transactionType: TransactionType.Transfer, ...rest }]}).countDocuments().exec();
		} else {
			count = await CryptoTransaction.find(
				{ $or: [{ userId }, { recipientId: userId, transactionType: TransactionType.Transfer }] }).countDocuments().exec();
		}

		return count;
	}
}

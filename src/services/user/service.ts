import mongoose, { ClientSession } from 'mongoose';
import { IDocument, IUserCreate, IList, IUserAdminCreate, IFindOneAndUpdate, IGetUserByIds, IUpdateUserRating,
	IUpdateUserFiatSumm, UserRating } from './interface';
import { User } from './model';
import { WalletService } from '../wallet/service';
import { CryptoCurrency, UserRoles } from '../../common/interface';
import { UserProfileService } from '../user-profile/service';
// import { ERRORS } from '../../common/errors';

const DEFAULT_CRYPTO_CURRENCY_AMOUNT = 0;

export class UserService {

	async create(params: IUserCreate): Promise<IDocument> {
		const session: ClientSession = await mongoose.startSession();

		session.startTransaction();
		try {
			const doc = await User.create(params);
			const { id } = doc;

			const prepareData = [];

			for (const cryptoCurrency of Object.values(CryptoCurrency)) {
				prepareData.push({ userId: id, cryptoCurrency, amount: DEFAULT_CRYPTO_CURRENCY_AMOUNT });
			}

			const walletService = new WalletService();
			const userProfileService = new UserProfileService();

			await walletService.createMany(prepareData);
			await userProfileService.create({ userId: id });
			await session.commitTransaction();
			session.endSession();

			return doc;
		} catch (e) {
			await session.abortTransaction();
			session.endSession();

			throw new Error(e);
		}
	}

	async createAdmin(params: IUserAdminCreate): Promise<IDocument> {
		const doc = await User.create({ ...params, role: UserRoles.Admin });

		return doc as IDocument;
	}

	async findById(id: string): Promise<IDocument> {
		const doc = await User.findById({ _id: id }).exec();

		return doc as IDocument;
	}

	async findByIds(params: IGetUserByIds): Promise<IDocument[]> {
		const { userIds } = params;
		const docs = await User.find({ _id: { $in: userIds } }).exec();

		return docs as IDocument[];
	}

	async findOne(email: string): Promise<IDocument | null> {
		const doc = await User.findOne({ email }).exec();

		return doc as IDocument;
	}

	async findByName(name: string): Promise<IDocument | null> {
		const doc = await User.findOne({ name }).exec();

		return doc as IDocument;
	}

	async find(params: IList): Promise<IDocument[]> {
		const docs = await User.find({}).skip(params.skip).limit(params.limit).exec();

		return docs as IDocument[];
	}

	async countDocuments(): Promise<number> {
		const count = await User.find({}).count().exec();

		return count as number;
	}

	async updateUserRating(params: IUpdateUserRating): Promise<IDocument> {
		const { userId, rating: incomingRating } = params;

		const { rating } = await User.findById({ _id: userId }).exec();
		const newRating = Number(rating) + Number(incomingRating);

		const doc = await User.findByIdAndUpdate(
			{ _id: userId }, { $set: { rating: newRating } }, { new: true }).exec();

		return doc;
	}

	async updateUserFiatSumm(params: IUpdateUserFiatSumm): Promise<IDocument> {
		const { userId, transactionInFiat: incomingTransactionInFiat } = params;

		const { transactionInFiat } = await User.findById({ _id: userId }).exec();
		const newTransactionInFiat = Number(transactionInFiat) + Number(incomingTransactionInFiat);

		const doc = await User.findByIdAndUpdate(
			{ _id: userId }, { $set: { transactionInFiat: newTransactionInFiat } }, { new: true }).exec();

		if (doc.transactionInFiat > 10000) {
			await this.updateUserRating({ userId, rating: UserRating.SUMM_IN_DEAL });
			await User.findByIdAndUpdate(
				{ _id: userId }, { $set: { transactionInFiat: 0 } }, { new: true }).exec();
		}

		return doc;
	}

	async findOneAndUpdate(params: IFindOneAndUpdate): Promise<IDocument> {
		const { userId, ...$set } = params;

		return await User.findByIdAndUpdate(userId, { $set }, { new: true }).exec();
	}

}

import { IAdvertCreate, IAdvertUpdate, IAdvertDelete, IAdvertFindById, IAdvertList, IListByIds, IDeactivate,
	IAdvertUpdateMaxLimit, IUpdateMany, ICountByOwnerId, IAdvertListCount, IAdvertActiveList, IActiveAdvertListCount,
	IAdvertFixedUpdate, IAdvertFloatUpdate, IAddMaxLimit, IActivate, IDocument } from './interface';
import { Advert } from './model';
import { UserAdvert } from '../../services/user-advert/model';
import { ERRORS } from '../../common/errors';
import { CommissionService } from '../commission/service';
import { Validator } from './validator';

export class AdvertService {
	async create(params: IAdvertCreate): Promise<IDocument> {
		const { cryptoCurrency, exchangeRate, spread = 0 } = params;
		const newExchangeRate = Number((Number(exchangeRate) + Number(exchangeRate * spread / 100)).toFixed(2));

		Object.assign(params, { exchangeRate: newExchangeRate, newExchangeRate });
		const commissionService = new CommissionService();
		const { commission } = await commissionService.findOne({ cryptoCurrency });

		const doc = await Advert.create({ ...params, commission });

		return doc as IDocument;
	}

	async update(params: IAdvertUpdate): Promise<IDocument> {
		const { id, ...$set } = params as IAdvertUpdate;

		const doc = await Advert.findByIdAndUpdate(id, { $set }, { new: true }).exec();

		return doc as IDocument;
	}

	async updateFixed(params: IAdvertFixedUpdate): Promise<IDocument> {
		const { id, ...$set } = params as IAdvertFixedUpdate;

		const doc = await Advert.findByIdAndUpdate(id, { $set, $unset: { spread: 1, newExchangeRate: 1 } }, { new: true }).exec();

		return doc as IDocument;
	}

	async updateFloat(params: IAdvertFloatUpdate): Promise<IDocument> {
		const { id, cryptoCurrency, ...$set } = params as IAdvertFloatUpdate;
		const { exchangeRate, spread = 0 } = params;
		const newExchangeRate = Number(exchangeRate) + Number(exchangeRate * spread / 100);

		Object.assign($set, { exchangeRate: newExchangeRate });
		const commissionService = new CommissionService();
		const { commission } = await commissionService.findOne({ cryptoCurrency });

		Object.assign($set, { commission });

		const doc = await Advert.findByIdAndUpdate(id, { $set }, { new: true }).exec();

		return doc as IDocument;
	}

	async updateMaxLimit(params: IAdvertUpdateMaxLimit): Promise<IDocument> {
		const { id, soldAmount } = params;
		const { maxLimit } = await Advert.findById({ _id: id }).exec();
		const newMaxLimit = parseFloat((Number(maxLimit) - Number(soldAmount)).toFixed(8));
		const doc = await this.update({ id, maxLimit: newMaxLimit });

		await Validator.isMaxLimitEqualZero({ id, maxLimit: newMaxLimit });
		return doc as IDocument;
	}

	async addMaxLimit(params: IAddMaxLimit): Promise<IDocument> {
		const { id, amount } = params;
		const { maxLimit } = await Advert.findById({ _id: id }).exec();
		const newMaxLimit = parseFloat((Number(maxLimit) + Number(amount)).toFixed(8));

		const doc = await this.update({ id, maxLimit: newMaxLimit });

		return doc;
	}

	async updateManyExchangeRate(params: IUpdateMany): Promise<IDocument[]> {
		const { cryptoCurrency, exchangeRate } = params;

		const docs = await Advert.updateMany(
			{ cryptoCurrency, isFixedRate: false },
			[{ $set: { newExchangeRate: { $round: [{ $sum: [{ $multiply: [ exchangeRate, '$spread', 0.01 ] }, exchangeRate] }, 2] } } }],
			{ multi: true, new: true }
		);

		return docs as unknown as IDocument[];
	}

	async delete(params: IAdvertDelete): Promise<IDocument> {
		const session = await Advert.startSession();

		session.startTransaction();
		try {
			const { id } = params;
			const advertDoc = await Advert.findByIdAndDelete({ _id: id }).exec();

			await UserAdvert.findOneAndDelete({ advertId: id }).exec();
			await session.commitTransaction();
			session.endSession();

			return advertDoc as IDocument;
		} catch (e) {
			await session.abortTransaction();
			session.endSession();
			throw new Error(ERRORS.TRANSACTION_FAILED);
		}
	}

	async findById(params: IAdvertFindById): Promise<IDocument> {
		const { id } = params;
		const doc = await Advert.findById({ _id: id }).exec();

		return doc as IDocument;
	}

	async list(params: IAdvertList): Promise<IDocument[]> {
		const { skip , limit, ...rest } = params;

		let docs: IDocument[] = [];
		const filter = Object.values(rest).filter((item) => { return item !== null; });

		if (filter.length > 0) {
			docs = await Advert.find(rest).skip(skip).limit(limit).exec();
		} else {
			docs = await Advert.find({}).skip(skip).limit(limit).exec();
		}

		return docs as IDocument[];
	}

	async activeList(params: IAdvertActiveList): Promise<IDocument[]> {
		const { skip , limit, ...rest } = params;

		let docs: IDocument[] = [];
		const filter = Object.values(rest).filter((item) => { return item !== null; });

		if (filter.length > 0) {
			docs = await Advert.find({ ...rest, isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
		} else {
			docs = await Advert.find({ isActive: true }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
		}

		return docs as IDocument[];
	}

	async listByAdvertIds(params: IListByIds): Promise<IDocument[]> {
		const { skip , limit, advertIds, ...rest } = params;

		let docs: IDocument[] = [];
		const filter = Object.values(rest).filter((item) => { return item !== null; });

		if (filter.length > 0) {
			docs = await Advert.find({ _id: { $in: advertIds }, ...rest }).skip(skip).limit(limit).exec();
		} else {
			docs = await Advert.find({ _id: { $in: advertIds } }).skip(skip).limit(limit).exec();
		}

		return docs as IDocument[];
	}

	async findByIds(advertIds: string[]): Promise<IDocument[]> {
		const docs = await Advert.find({ _id: { $in: advertIds } }).exec();

		return docs as IDocument[];
	}

	async deactivate(params: IDeactivate): Promise<IDocument> {
		const { id } = params;
		const doc = await Advert.findByIdAndUpdate(id, { $set: { isActive: false } }).exec();

		return doc as IDocument;
	}

	async activate(params: IActivate): Promise<IDocument> {
		const { id } = params;
		const doc = await Advert.findByIdAndUpdate(id, { $set: { isActive: true } }).exec();

		return doc as IDocument;
	}

	async count(params: IAdvertListCount): Promise<number> {

		const filter = Object.values(params).filter((item) => item !== null);

		let count = 0;

		if (filter.length > 0) {
			count = await Advert.find(params).count().exec();
		} else {
			count = await Advert.find({}).count().exec();
		}

		return count;
	}

	async countActive(params: IActiveAdvertListCount): Promise<number> {

		const filter = Object.values(params).filter((item) => item !== null);

		let count = 0;

		if (filter.length > 0) {
			count = await Advert.find({ ...params, isActive: true }).count().exec();
		} else {
			count = await Advert.find({ isActive: true }).count().exec();
		}

		return count;
	}

	async countByOwnerId(params: ICountByOwnerId): Promise<number> {
		const { owner } = params;
		const filter = Object.values(params).filter((item) => item !== null);

		let count = 0;

		if (filter.length > 0) {
			count = await Advert.find({ owner, ...params }).count().exec();
		} else {
			count = await Advert.find({ owner }).count().exec();
		}

		return count;
	}
}

import { IUserAdvertCreate, IUserAdvertUpdate, IUserAdvertDelete, IUserAdvertList,
	IUserAdvertFindById, IDocument, IFindAdvert, IFindMany } from './interface';
import { UserAdvert } from './model';

export class UserAdvertService {
	async create(params: IUserAdvertCreate): Promise<IDocument> {
		const doc = await UserAdvert.create(params);

		return doc as IDocument;
	}

	async update(params: IUserAdvertUpdate): Promise<IDocument> {
		const { id, ...rest } = params;
		const doc = await UserAdvert.findByIdAndUpdate(id, { ...rest }, { new: true }).exec();

		return doc as IDocument;
	}

	async delete(params: IUserAdvertDelete): Promise<IDocument> {
		const { id } = params;
		const doc = await UserAdvert.findOneAndDelete({ id }).exec();

		return doc as IDocument;
	}

	async findById(params: IUserAdvertFindById): Promise<IDocument> {
		const { id } = params;
		const doc = await UserAdvert.findById({ id }).exec();

		return doc;
	}

	async find(params: IFindAdvert): Promise<IDocument> {
		let doc: IDocument;

		if (params?.advertId) {
			doc = await UserAdvert.findOne({ advertId: params.advertId }).exec();
		} else {
			doc = await UserAdvert.findOne({ userId: params.userId }).exec();
		}

		return doc;
	}

	async findMany(params: IFindMany): Promise<IDocument[] | null> {
		const { advertIds } = params;
		const docs = await UserAdvert.find({ advertId: { $in: advertIds } }).exec();

		return docs as IDocument[];
	}

	async getListByUserId(params: IUserAdvertList): Promise<IDocument[]> {
		const { userId } = params;
		const docs = await UserAdvert.find({ userId }).exec();

		return docs as IDocument[];
	}
}

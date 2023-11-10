import { CryptoCurrency } from './model';
import { ICryptoCurrencyCreate, ICryptoCurrencyUpdate, ICryptoCurrencyFindOneAndUpdate, IFindOne, IDocument } from './interface';

export class CryptoCurrencyService {
	async create(params: ICryptoCurrencyCreate): Promise<IDocument> {
		const doc = await CryptoCurrency.create(params);

		return doc as IDocument;
	}

	async update(params: ICryptoCurrencyUpdate): Promise<IDocument> {
		const { id, ...rest } = params;
		const doc = await CryptoCurrency.findByIdAndUpdate(id, { ...rest }, { new: true }).exec();

		return doc;
	}

	async findOneAndUpdate(params: ICryptoCurrencyFindOneAndUpdate): Promise<IDocument> {
		const { currencyType, ...rest } = params;
		const isExist = await CryptoCurrency.findOne({ currencyType }).exec();

		let doc: IDocument;

		if (!isExist) {
			doc = await CryptoCurrency.create({ currencyType });

		} else {
			doc = await CryptoCurrency.findOneAndUpdate({ currencyType }, { ...rest }, { new: true }).exec();
		}

		return doc as IDocument;
	}

	async list(): Promise<IDocument[]> {
		const docs = await CryptoCurrency.find({}).exec();

		return docs as IDocument[];
	}

	async findOne(params: IFindOne): Promise<IDocument> {
		const { currencyType } = params;
		const doc = await CryptoCurrency.findOne({ currencyType }).exec();

		return doc as IDocument;
	}
}

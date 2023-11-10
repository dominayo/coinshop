import { IDocument, ICreate, IUpdate, IFindOne, ICalculateAmountWithCommission, ICalculateAmountFromCommission } from './interface';
import { Commission } from './model';

export class CommissionService {
	async create(params: ICreate): Promise<IDocument> {
		const doc = await Commission.create(params);

		return doc as IDocument;
	}

	async update(params: IUpdate): Promise<IDocument> {
		const { cryptoCurrency , commission } = params;
		const doc = await Commission.findOneAndUpdate({ cryptoCurrency }, { $set: { commission } }, { new: true }).exec();

		return doc as IDocument;
	}

	async findOne(params: IFindOne): Promise<IDocument> {
		const { cryptoCurrency  } = params;
		const doc = await Commission.findOne({ cryptoCurrency }).exec();

		return doc as IDocument;
	}

	async list(): Promise<IDocument[]> {
		const docs = await Commission.find({}).exec();

		return docs as IDocument[];
	}

	async calculateAmountWithCommission(params: ICalculateAmountWithCommission): Promise<number> {
		const { amount, commission } = params;
		const amountWithCommission = parseFloat((Number(amount) + Number(amount * commission)).toFixed(8));

		return amountWithCommission;
	}

	async calculateCommissionFromAmount(params: ICalculateAmountFromCommission): Promise<number> {
		const { amount, commission } = params;

		const amountOfCommission = parseFloat((Number(amount) * Number(commission)).toFixed(8));

		return amountOfCommission;
	}
}

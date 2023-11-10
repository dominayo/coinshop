/* eslint-disable camelcase */
import { FiatCurrency } from './model';
import { IUpsert, IDocument } from './interface';

export class FiatCurrencyService {
	async upsert(params: IUpsert): Promise<IDocument> {
		const { ccy, base_ccy } = params;
		const doc = await FiatCurrency.findOneAndUpdate(
			{ ccy, base_ccy }, { ...params }, { upsert: true } ).exec();

		return doc;
	}

	async list(): Promise<IDocument[]> {
		const docs = await FiatCurrency.find({}).exec();

		return docs as IDocument[];
	}
}

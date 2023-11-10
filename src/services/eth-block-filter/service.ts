import { IUpsert, IDocument } from './interface';
import { EthBlockFilter } from './model';
import { RPCTransportService } from '../../transports/rpc/service';

export class EthBlockFilterService {
	async upsert(params: IUpsert): Promise<IDocument> {
		return await EthBlockFilter.findOneAndUpdate({}, params, { upsert: true }).exec();
	}

	async findOneOrCreate(): Promise<IDocument> {
		let doc = await EthBlockFilter.findOne({}).exec();

		if (!doc) {
			const rPCTransportService = new RPCTransportService();

			const filter = await rPCTransportService.getEthNewBlockFilter();

			doc = await EthBlockFilter.create({ filter });
		}

		return doc;
	}

	async find(): Promise<IDocument> {
		return await EthBlockFilter.findOne({}).exec();
	}
}

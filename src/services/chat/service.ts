import { Chat } from './model';
import { IChatCreate, IFindById, IByDealId, IDocument } from './interface';

export class ChatService {
	async create(params: IChatCreate): Promise<IDocument> {
		const doc = await Chat.create(params);

		return doc as IDocument;
	}

	async findById(params: IFindById): Promise<IDocument> {
		const { id } = params;
		const doc = await Chat.findById({ _id: id }).exec();

		return doc as IDocument;
	}

	async findByDealId(params: IByDealId): Promise<IDocument> {
		const { dealId } = params;
		const doc = await Chat.findOne({ dealId }).exec();

		return doc as IDocument;
	}
}

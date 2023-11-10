import { ChatDisputeMessage } from './model';
import { ICreate, IList, IGetMessage, IDocument } from './interface';

export class ChatDisputeMessageService {
	async create(params: ICreate): Promise<IDocument> {
		const doc = await ChatDisputeMessage.create(params);

		return doc as IDocument;
	}

	async list(params: IList): Promise<IDocument[]> {
		const { chatId } = params;
		const docs = await ChatDisputeMessage.find({ chatId }).exec();

		return docs as IDocument[];
	}

	async getMessage(params: IGetMessage): Promise<IDocument> {
		const { id } = params;

		return await ChatDisputeMessage.findById({ _id: id }).exec();
	}
}

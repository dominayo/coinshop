import { ChatMessage } from './model';
import { IDocument, IChatMessageCreate, IChatMessageList, IGetMessage } from './interface';

export class ChatMessageService {
	async create(params: IChatMessageCreate): Promise<IDocument> {
		const doc = await ChatMessage.create(params);

		return doc as IDocument;
	}

	async list(params: IChatMessageList): Promise<IDocument[]> {
		const { chatId } = params;
		const docs = await ChatMessage.find({ chatId }).sort({ createdAt: 1 }).exec();

		return docs as IDocument[];
	}

	async getMessage(params: IGetMessage): Promise<IDocument> {
		const { id } = params;

		return await ChatMessage.findById({ _id: id });
	}
}

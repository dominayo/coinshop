import { ERRORS } from '../../common/errors';
import { IDocument, IFindById, IIsChatParticipantParams } from './interface';
import { ChatService } from './service';

export class Validator {
	public static async isExists(params: IFindById): Promise<IDocument> {
		const { id } = params;
		const chatService = new ChatService();
		const doc = await chatService.findById({ id });

		if (!doc) {
			throw new Error(ERRORS.CHAT_NOT_FOUND);
		}

		return doc as IDocument;
	}

	public static async isChatParticipant(params: IIsChatParticipantParams): Promise<IDocument> {
		const { id, userId } = params;
		const chatService = new ChatService();
		const doc = await chatService.findById({ id });

		if (!doc) {
			throw new Error(ERRORS.CHAT_NOT_FOUND);
		}

		if (doc?.owner !== userId && doc?.customerId !== userId) {
			throw new Error(ERRORS.CHAT_NOT_PARTICIPANT);
		}

		return doc as IDocument;
	}
}

export default Validator;

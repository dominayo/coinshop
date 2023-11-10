import Joi from 'joi';
import { ERRORS } from '../common/errors';
import IChatDocument, { IFindById } from '../services/chat/interface';
import IDealDocument, { IIsExists, IIsNotStatusesMatch } from '../services/deal/interface';
import { IIsChatDisputeExists, ISendChatMessage } from './interface';
import { ChatService } from '../services/chat/service';
import { ChatDisputeService } from '../services/chat-dispute/service';
import { MessageType, ContentType } from '../services/chat-dispute/messages/interface';
import { DealService } from '../services/deal/service';
import { IDocument as IChatDisputeDocument } from '../services/chat-dispute/interface';

export class Validator {

	public static async sendChatMessage(params: ISendChatMessage): Promise<Error> {
		const schema = Joi.object().keys({
			chatId: Joi.string().hex().length(24).required(),
			message: Joi.string().required(),
			messageType: Joi.string().valid(...Object.values(MessageType)),
			contentType: Joi.string().valid(...Object.values(ContentType))
		});
		const { error } = schema.validate(params);

		if (error) {
			return error;
		}
	}

	public static async sendChatDisputeMessage(params: ISendChatMessage): Promise<Error> {
		const schema = Joi.object().keys({
			chatId: Joi.string().hex().length(24).required(),
			message: Joi.string().required(),
			messageType: Joi.string().valid(...Object.values(MessageType)),
			contentType: Joi.string().valid(...Object.values(ContentType))
		});
		const { error } = schema.validate(params);

		if (error) {
			return error;
		}
	}

	public static async isChatExists(params: IFindById): Promise<IChatDocument> {
		const { id } = params;
		const chatService = new ChatService();
		const doc = await chatService.findById({ id });

		if (!doc) {
			throw ERRORS.CHAT_NOT_FOUND;
		}

		return doc as IChatDocument;
	}

	public static async isDealExists(params: IIsExists): Promise<IDealDocument> {
		const dealService = new DealService();

		const doc = await dealService.findById(params);

		if (!doc) {
			throw ERRORS.DEAL_NOT_FOUND;
		}

		return doc as IDealDocument;
	}

	public static async isNotStatusMatch(params: IIsNotStatusesMatch): Promise<void> {
		const dealService = new DealService();

		const doc = await dealService.findById(params);
		const { statuses } = params;

		if (statuses.includes(doc?.status)) {
			throw ERRORS.DEAL_BAD_STATUS;
		}
	}

	public static async isChatDisputeExists(params: IIsChatDisputeExists): Promise<IChatDisputeDocument> {
		const { id } = params;
		const chatDisputeService = new ChatDisputeService();
		const doc = await chatDisputeService.findById({ id });

		if (!doc) {
			throw ERRORS.CHAT_DISPUTE_NOT_FOUND;
		}

		return doc as IChatDisputeDocument;
	}
}

export default Validator;

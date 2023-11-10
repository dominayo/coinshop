import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { Authorization } from '../../middleware/auth';
import UserValidator from '../user/validator';
import DealValidator from '../../../services/deal/validator';
import ChatValidator from '../../../services/chat/validator';
import { ERRORS } from '../../../common/errors';
import { ChatService } from '../../../services/chat/service';
import { ChatMessageService } from '../../../services/chat/messages/service';
import { IGetParams } from './interface';
import { Validator } from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IGetParams;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.getParams(params);

		const { id } = params;
		const chatMessageService = new ChatMessageService();
		const chatMessageDoc = await chatMessageService.getMessage({ id });

		if (!chatMessageDoc) {
			throw new Error(ERRORS.CHAT_MESSAGE_NOT_FOUND);
		}

		const { chatId, message, contentType } = chatMessageDoc;

		await ChatValidator.isExists({ id: chatId });
		await ChatValidator.isChatParticipant({ id: chatId, userId });

		const chatService = new ChatService();
		const { dealId } = await chatService.findById({ id: chatId });

		await DealValidator.isExists({ id: dealId });

		const innerPath = `${process.env.DEAL_FILE_PATH}/deals/${dealId}/chats/${chatId}/${message}`;
		const fileBuffer = fs.readFileSync(innerPath);

		res.status(201).contentType(contentType).send(fileBuffer);

	}	catch (e) {
		next(e);
	}
};

export default route;

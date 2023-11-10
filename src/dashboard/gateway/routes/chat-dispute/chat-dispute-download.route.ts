import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { Authorization } from '../../middleware/auth';
import { ERRORS } from '../../../../common/errors';
import ChatDisputeValidator from '../../../../services/chat-dispute/validator';
import { ChatDisputeMessageService } from '../../../../services/chat-dispute/messages/service';
import { ChatDisputeService } from '../../../../services/chat-dispute/service';
import { IChatFileParams } from './interface';
import UserValidator from '../validator';
import ChatValidator from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IChatFileParams;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await UserValidator.isUserExists(adminId);
		await UserValidator.isAdmin(adminId);
		await ChatValidator.chatDisputeFileParams(params);

		const { id } = params;
		const chatDisputeMessageService = new ChatDisputeMessageService();
		const chatMessageDoc = await chatDisputeMessageService.getMessage({ id });

		if (!chatMessageDoc) {
			throw new Error(ERRORS.CHAT_MESSAGE_NOT_FOUND);
		}

		const { chatId, message } = chatMessageDoc;

		await ChatDisputeValidator.isExists({ id: chatId });

		const chatDisputeService = new ChatDisputeService();
		const { dealId } = await chatDisputeService.findById({ id: chatId });

		const innerPath = `${process.env.DEAL_FILE_PATH}/deals/${dealId}/chats/${chatId}/${message}`;
		const fileBuffer = fs.readFileSync(innerPath);

		res.status(201).send(fileBuffer);

	}	catch (e) {
		next(e);
	}
};

export default route;

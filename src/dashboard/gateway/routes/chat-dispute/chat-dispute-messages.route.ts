import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../../common/errors';
import { Validator } from '../validator';
import ChatDisputeMessageValidator from './validator';
import { TokenService } from '../../../../utils/token';
import { Authorization } from '../../middleware/auth';
import { ChatDisputeMessageService } from '../../../../services/chat-dispute/messages/service';
import { IChatDisputeMessageList } from './interface';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IChatDisputeMessageList;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await Validator.isUserExists(adminId);
		await Validator.isAdmin(adminId);
		await ChatDisputeMessageValidator.chatDisputeMessageList(params);
		const { chatDisputeId } = params;

		const chatDisputeMessageService = new ChatDisputeMessageService();
		const messages = await chatDisputeMessageService.list({ chatId: chatDisputeId });
		const dto = [];

		for (const message of messages) {
			dto.push(_.pick(message, ['message', 'userId', 'messageType', 'contentType']));
		}

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: adminId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.status(201).json({ status: 201, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;

import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../../common/errors';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { Authorization } from '../../middleware/auth';
import { IChatMessageList } from '../interface';
import { ChatDisputeMessageService } from '../../../../services/chat-dispute/messages/service';
import { Validator as ChatDisputeValidator } from '../../../../services/chat-dispute/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IChatMessageList;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await Validator.isUserExists(adminId);
		await Validator.isAdmin(adminId);
		await ChatDisputeValidator.isExists({ id: params.chatId });
		await Validator.chatMessageListParams(params);

		const chatDisputeMessageService = new ChatDisputeMessageService();
		const chatMessages = await chatDisputeMessageService.list(params);
		const dto = [];

		for (const chatMessage of chatMessages) {
			dto.push(_.pick(chatMessage, ['id', 'chatId', 'message', 'userId', 'role', 'messageType', 'contentType', 'createdAt']));
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

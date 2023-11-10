import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { UserService } from '../../../services/user/service';
import { IChatMessageList } from './interface';
import { ChatMessageService } from '../../../services/chat/messages/service';
// import DealValidator from '../../../deal/validator';
import ChatValidator from '../../../services/chat/validator';
import { Validator } from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IChatMessageList;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		const userService = new UserService();
		const user = await userService.findById(userId);

		if (!user) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}

		await Validator.messageList(params);
		const { chatId } = params;

		await ChatValidator.isExists({ id: chatId });
		await ChatValidator.isChatParticipant({ id: chatId, userId });

		const chatMessageService = new ChatMessageService();
		const chatMessageList = await chatMessageService.list({ chatId });
		const dto = [];

		for (const chatMessage of chatMessageList) {
			const userDoc = await userService.findById(chatMessage.userId);
			const prepareMessage = _.pick(chatMessage, ['chatId', 'id', 'message', 'messageType', 'contentType', 'createdAt']);

			dto.push({ ...prepareMessage, email: userDoc.email });
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;

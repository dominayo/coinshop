import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { UserService } from '../../../services/user/service';
import { IDisputeMessageList } from './interface';
import { ChatDisputeMessageService } from '../../../services/chat-dispute/messages/service';
// import DealValidator from '../../../deal/validator';
import ChatDisputeValidator from '../../../services/chat-dispute/validator';
import { Validator } from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDisputeMessageList;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		const userService = new UserService();
		const userDoc = await userService.findById(userId);

		if (!userDoc) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}

		await Validator.disputeMessageList(params);
		const { chatId } = params;

		await ChatDisputeValidator.isExists({ id: chatId });
		await ChatDisputeValidator.isChatDisputeParticipant({ id: chatId , userId });

		const chatDisputeMessageService = new ChatDisputeMessageService();
		const chatDisputeMessageList = await chatDisputeMessageService.list({ chatId });
		const dto = [];

		for (const chatDisputeMessage of chatDisputeMessageList) {
			const prepareMessage =
				_.pick(chatDisputeMessage, ['chatId', 'id', 'userId', 'message', 'createdAt', 'messageType', 'contentType']);

			const { email } = await userService.findById(prepareMessage.userId);

			Object.assign(prepareMessage, { email });

			dto.push(prepareMessage);
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;

import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../../common/errors';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { Authorization } from '../../middleware/auth';
import { NotificationDashboardService } from '../../../../services/notifications/dashboard/service';
import { ChatDisputeService } from '../../../../services/chat-dispute/service';
import { UserService } from '../../../../services/user/service';
import { IUpdateParams } from './interface';
import { Validator as NotificationValidator } from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IUpdateParams;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await Validator.isUserExists(adminId);
		await Validator.isAdmin(adminId);
		await NotificationValidator.updateParams(params);

		const { chatId } = params;

		const chatDisputeService = new ChatDisputeService();
		const chatDisputeDoc = await chatDisputeService.findById({ id: chatId });

		const notificationDashboardService = new NotificationDashboardService();
		const notificationDoc = await notificationDashboardService.updateByChatId({ chatId: chatDisputeDoc._id });

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: adminId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.status(201).json({ status: 201, message: notificationDoc });
	} catch (e) {
		next(e);
	}
};

export default route;

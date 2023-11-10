import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../../common/errors';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { Authorization } from '../../middleware/auth';
import { NotificationDashboardService } from '../../../../services/notifications/dashboard/service';
import { ChatDisputeService } from '../../../../services/chat-dispute/service';
import { UserService } from '../../../../services/user/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await Validator.isUserExists(adminId);
		await Validator.isAdmin(adminId);

		const notificationDashboardService = new NotificationDashboardService();
		const notificationDocs = await notificationDashboardService.list();
		const chatDisputeIds = notificationDocs
			.map((notificationDoc) => {
				return notificationDoc.chatDisputeId;
			});
		const chatDisputeService = new ChatDisputeService();
		const chatDisputeDocs = await chatDisputeService.listByNotificationIds({ chatDisputeIds });
		const dto = [];

		const userService = new UserService();

		for (const notificationDoc of notificationDocs) {

			for (const chatDisputeDoc of chatDisputeDocs) {
				if (chatDisputeDoc.id === notificationDoc.chatDisputeId) {
					const prepareData = {};
					const notification = _.pick(notificationDoc, ['chatDisputeId', 'isRead']);
					const chatDispute = _.pick(chatDisputeDoc, ['dealId', 'creatorId', 'participants', 'isActive', 'createdAt']);
					const userDoc = await userService.findById(chatDispute.creatorId);
					const user = _.pick(userDoc, ['email', 'name', 'secondName', 'role']);

					Object.assign(prepareData, notification, chatDispute, user);
					dto.push(prepareData);
				}
			}
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

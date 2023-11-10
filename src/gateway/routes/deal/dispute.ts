import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { ERRORS } from '../../../common/errors';
import { IDealMoneyNotRecieved } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { EmailClient } from '../../../clients/mailer';
import { UserService } from '../../../services/user/service';
import { DealService } from '../../../services/deal/service';
import { Validator as DealValidator } from '../../../services/deal/validator';
import { Status,StatusTiming } from '../../../services/deal/interface';
import { ChatDisputeService } from '../../../services/chat-dispute/service';
import { NotificationDashboardService } from '../../../services/notifications/dashboard/service';
import { UserProfileService } from '../../../services/user-profile/service';
import dotenv from 'dotenv';

dotenv.config();

const domainName = process.env.DOMAIN_NAME;

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealMoneyNotRecieved;
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

		await Validator.moneyNotReceived(params);
		const { id } = params;

		const dealDoc = await DealValidator.isExists({ id });

		await DealValidator.isStatusMatchForDispute({ id, statuses: [Status.MoneySent] });
		await DealValidator.isInDeal({ id, userId });
		await DealValidator.isBuyer({ dealId: id, userId });
		await DealValidator.isExired({ dealId: id });

		const dealService = new DealService();

		await dealService.updateTimer({ dealId: id, statusTiming: StatusTiming.DISPUT_OPENED });

		const dateNow = moment(Date.now());
		const { id: dealId, owner, customerId } = await dealService.updateStatus(
			{ id, status: Status.DisputeOpened, statusTiming: { status: Status.DisputeOpened, changedAt: dateNow } });

		const { email: ownerEmail } = await userService.findById(owner);
		const { email: customerEmail } = await userService.findById(customerId);
		/** Dispute chat start **/
		const chatDisputeService = new ChatDisputeService();

		const { id: chatDisputeId } = await chatDisputeService.create({ dealId, creatorId: userId });
		const notificationDashboardService = new NotificationDashboardService();

		await notificationDashboardService.create({ chatDisputeId });
		/** Dispute chat end **/

		const userProfileService = new UserProfileService();

		await userProfileService.update({ userId, disputeOpenedCount: 1 });

		const emailClient = new EmailClient();

		await emailClient.send(
			`Открыт арбитраж, ${domainName}user/deals?id=${dealDoc.id}`, ownerEmail, 'Открыт арбитраж');
		await emailClient.send(
			`Открыт арбитраж, ${domainName}user/deals?id=${dealDoc.id}`, customerEmail, 'Открыт арбитраж');

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: { chatDisputeId } });
	} catch (e) {
		next(e);
	}
};

export default route;

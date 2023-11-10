import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { Authorization } from '../../middleware/auth';
import { ERRORS } from '../../../../common/errors';
import { DealService } from '../../../../services/deal/service';
import { AdvertService } from '../../../../services/advert/service';
import { WalletService } from '../../../../services/wallet/service';
import { UserService } from '../../../../services/user/service';
import { CommissionService } from '../../../../services/commission/service';
import { ChatDisputeService } from '../../../../services/chat-dispute/service';
import { NotificationDashboardService } from '../../../../services/notifications/dashboard/service';
import { UserProfileService } from '../../../../services/user-profile/service';
import { EmailClient } from '../../../../clients/mailer';
import { IApproveParams } from './interface';
import { Status } from '../../../../services/deal/interface';
import { ExchangeType } from '../../../../common/interface';
import UserValidator from '../validator';
import ChatValidator from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IApproveParams;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await UserValidator.isUserExists(adminId);
		await UserValidator.isAdmin(adminId);
		await ChatValidator.approveParams(params);

		const { approve, dealId } = params;

		const chatDisputeService = new ChatDisputeService();
		const { id } = await chatDisputeService.findByDealId({ dealId });

		await chatDisputeService.findByIdAndUpdate({ id, isActive: false });

		const notificationDashboardService = new NotificationDashboardService();

		await notificationDashboardService.delete({ id });

		const dealService = new DealService();
		const walletService = new WalletService();
		const advertService = new AdvertService();
		const emailClient = new EmailClient();
		const userProfileService = new UserProfileService();

		const dealDoc = await dealService.findById({ id: dealId });
		const { advertId, owner, customerId, amount } = dealDoc;
		const advertDoc = await advertService.findById({ id: advertId });

		const userService = new UserService();
		const { email: ownerEmail } = await userService.findById(owner);
		const { email: customerEmail } = await userService.findById(customerId);

		if (approve === true) {
			/** Crypto transaction start **/
			const dateNow = moment(Date.now());

			await dealService.updateStatus({ id: dealId, status: Status.MoneyReceived,
				statusTiming: { status: Status.MoneyReceived, changedAt: dateNow } });
			await walletService.transfer({ owner, customerId, amount, cryptoCurrency: advertDoc.cryptoCurrency,
				type: advertDoc.type, commission: advertDoc.commission, advertId: advertDoc.id });
			await dealService.updateStatus(
				{ id: dealId, status: Status.Сompleted, statusTiming: { status: Status.Сompleted, changedAt: dateNow } });
			/** Crypto transaction end **/

			if (advertDoc.type === ExchangeType.Buy) {
				await userProfileService.update({ userId: customerId, disputeLost: 1 });
				await userProfileService.update({ userId: owner, deals: 1 });
			} else {
				await userProfileService.update({ userId: owner, disputeLost: 1 });
				await userProfileService.update({ userId: customerId, deals: 1 });
			}

			await emailClient.send(
				`Сделка успешно завершена, http://coinshop.dev-page.site/user/deals?id=${dealId}`, ownerEmail, 'Сделка завершена');
			await emailClient.send(
				`Сделка успешно завершена, http://coinshop.dev-page.site/user/deals?id=${dealId}`, customerEmail, 'Сделка завершена');
		} else {
			if (advertDoc.type === ExchangeType.Buy) {
				// const commissionService = new CommissionService();
				// const unhold = await commissionService.calculateAmountWithCommission(
				// 	{ amount, cryptoCurrency: advertDoc.cryptoCurrency, commission: advertDoc.commission });
				const walletService = new WalletService();

				await walletService.unholdCryptoCurrency({ userId: customerId , cryptoCurrency: advertDoc.cryptoCurrency, unhold: amount });
				await userProfileService.update({ userId: customerId, disputeLost: 1 });
				await advertService.addMaxLimit({ id: advertId, amount });
				await advertService.activate({ id: advertId });
			} else {
				await advertService.addMaxLimit({ id: advertId, amount });
				await advertService.activate({ id: advertId });
				const commissionService = new CommissionService();
				const unhold = await commissionService.calculateAmountWithCommission(
					{ amount, cryptoCurrency: advertDoc.cryptoCurrency, commission: advertDoc.commission });
				const walletService = new WalletService();

				await walletService.unholdCryptoCurrency({ userId: owner , cryptoCurrency: advertDoc.cryptoCurrency, unhold });
				await userProfileService.update({ userId: customerId, disputeLost: 1 });
			}

			const dateNow = moment(Date.now());

			await dealService.updateStatus(
				{ id: dealId, status: Status.Closed, statusTiming: { status: Status.Closed, changedAt: dateNow } });
			const { email: customerEmail } = await userService.findById(customerId);
			const { email: ownerEmail } = await userService.findById(owner);

			await emailClient.send(
				`Сделка закрыта, http://coinshop.dev-page.site/user/deals?id=${dealId}`, ownerEmail, 'Сделка закрыта');
			await emailClient.send(
				`Сделка закрыта, http://coinshop.dev-page.site/user/deals?id=${dealId}`, customerEmail, 'Сделка закрыта');
		}

		res.status(201).json({ status: 201 });
	}	catch (e) {
		next(e);
	}
};

export default route;

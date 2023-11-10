import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../middleware/auth';
import { Validator } from './validator';
import { Status } from '../../../services/inner-crypto-transaction/interface';
import { UserService } from '../../../services/user/service';
import { AdvertService } from '../../../services/advert/service';
import { UserAdvertService } from '../../../services/user-advert/service';
import { DealService } from '../../../services/deal/service';
import { CryptoTransactionService } from '../../../services/inner-crypto-transaction/service';
import { CommissionService } from '../../../services/commission/service';
import { WalletService } from '../../../services/wallet/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const cookies = req.cookies;

		if (!cookies?.authorization) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		const payload = await authorization.decodeToken(token);

		const { userId } = payload;

		await Validator.isUserExists(userId);
		await Validator.isAdmin(userId);

		const userService = new UserService();
		const users = await userService.find({ skip: 0, limit: 50 });
		const userCountDocs = await userService.countDocuments();
		const userCountPages = Math.ceil(userCountDocs / 50);
		const userPages = [];

		for (let i = 1; i <= userCountPages; i++) {
			userPages.push(i);
		}

		const advertService = new AdvertService();
		const adverts = await advertService.list({}); // TODO add custom sorting
		const advertCountDocs = await advertService.count({});
		const advertCountPages = Math.ceil(advertCountDocs / 50);

		const advertPages = [];

		for (let i = 1; i <= advertCountPages; i++) {
			advertPages.push(i);
		}

		const prepareAdverts = [];

		for (const advert of adverts) {
			const formatedAdvert = _.pick(advert,
				['id', 'type', 'cryptoCurrency', 'direction', 'isFixedRate',
					'exchangeRate', 'spread', 'minLimit', 'maxLimit', 'comments']);

			prepareAdverts.push(formatedAdvert);
		}

		const advertIds: string[] = adverts.map((advert) => {
			return advert.id;
		});

		const userAdvertService = new UserAdvertService();
		const userAdvertsDocs = await userAdvertService.findMany({ advertIds });
		const advertsWithUserId = [];

		for (const advert of prepareAdverts) {
			for (const userAdvertsDoc of userAdvertsDocs) {
				if (JSON.stringify(userAdvertsDoc.advertId) === JSON.stringify(advert.id)) {
					const user = await userService.findById(userAdvertsDoc.userId);

					advertsWithUserId.push({ ...advert, email: user.email });
				}
			}
		}

		const dealService = new DealService();
		const deals = await dealService.list({});

		const dealsCountDocs = await dealService.count();
		const dealsCountPages = Math.ceil(dealsCountDocs / 50);

		const dealPages = [];

		for (let i = 1; i <= dealsCountPages; i++) {
			dealPages.push(i);
		}

		const cryptoTransactionService = new CryptoTransactionService();
		const cryptoTransactionDocs = await cryptoTransactionService.list({ skip: 0, limit: 50 });
		const cryptoTransactions = [];

		const cryptoTransactionCountDocs = await cryptoTransactionService.count();
		const cryptoTransactionCountPages = Math.ceil(cryptoTransactionCountDocs / 50);

		const cryptoTransactionPages = [];

		for (let i = 1; i <= cryptoTransactionCountPages; i++) {
			cryptoTransactionPages.push(i);
		}

		for (const cryptoTransactionDoc of cryptoTransactionDocs) {
			const { email } = await userService.findById(cryptoTransactionDoc.userId);
			const prepareAcryptoTransaction = _.pick(cryptoTransactionDoc,
				['_id', 'status', 'transactionType', 'cryptoCurrency', 'amount']);

			cryptoTransactions.push({ ...prepareAcryptoTransaction, email });
		}

		const commissionService = new CommissionService();
		const commissions = await commissionService.list();

		const walletService = new WalletService();
		const processingTransactionDocs = await cryptoTransactionService.listProcessing({ skip: 0, limit: 50 });

		const prepareProcessingData = [];

		for (const processingTransactionDoc of processingTransactionDocs) {
			const prepareProcessingTransaction = _.pick(processingTransactionDoc, ['status', 'transactionType', 'wallet', 'id', 'to']);

			Object.assign(prepareProcessingTransaction, { widthraw: processingTransactionDoc.amount });
			const userDoc = await userService.findById(processingTransactionDoc.userId);
			const prepareUserData = _.pick(userDoc, ['email', 'name']);
			const walletDoc = await walletService.findUserWallets({ userId: processingTransactionDoc.userId });
			const [filterWallet] = walletDoc.filter((userWallet) => {
				return userWallet.cryptoCurrency === processingTransactionDoc.cryptoCurrency;
			});
			const prepareWallet = _.pick(filterWallet, ['amount', 'wallet', 'cryptoCurrency', 'hold']);
			const freeAmount = Number(prepareWallet.amount) - Number(prepareWallet.hold);

			Object.assign(prepareWallet, { freeAmount });

			prepareProcessingData.push({ ...prepareProcessingTransaction, ...prepareUserData, ...prepareWallet });
		}

		const processingTransactionCount = await cryptoTransactionService.countProcessing();
		const processingTransactionCountPages = Math.ceil(processingTransactionCount / 50);

		const processingTransactionPages = [];

		for (let i = 1; i <= processingTransactionCountPages; i++) {
			processingTransactionPages.push(i);
		}

		if (processingTransactionPages.length === 0) {
			processingTransactionPages.push(1);
		}

		res.render('dashboard.ejs',  {
			users, userPages, adverts: advertsWithUserId, advertPages, deals, dealPages,
			cryptoTransactions, cryptoTransactionPages, commissions, widthrawData: prepareProcessingData, processingTransactionPages });
	} catch (e) {
		next(e);
	}
};

export default route;

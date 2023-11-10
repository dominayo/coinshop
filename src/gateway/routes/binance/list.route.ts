import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { CurrencyTransportService } from '../../../binance/currency-transport';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const currencyTransportService = new CurrencyTransportService();

		const jsonData = await currencyTransportService.getPrices();

		const { userId } = await authorization.decodeToken(token);
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;

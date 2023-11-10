import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { IDealDelete } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { DealService } from '../../../services/deal/service';
import UserValidator from '../user/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealDelete;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await Validator.delete(params);
		await UserValidator.isUserExists(userId);

		const dealService = new DealService();
		const doc = await dealService.delete(params);

		const jsonData = _.pick(doc, ['owner', 'customerId', 'advertId', 'countCurrency', 'status']);

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(204).json({ code: 204, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;

import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import UserValidator from '../user/validator';
import { CommissionService } from '../../../services/commission/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);

		const commissionService = new CommissionService();
		const commissionDocs = await commissionService.list();

		const dto = [];

		for (const commissionDoc of commissionDocs) {
			const prepareCommission = _.pick(commissionDoc, ['cryptoCurrency', 'commission']);

			dto.push(prepareCommission);
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;

import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../../common/errors';
import { Validator } from '../validator';
import { CommissionService } from '../../../../services/commission/service';
import { TokenService } from '../../../../utils/token';
import { Authorization } from '../../middleware/auth';
import { ICommissionUpdate } from '../interface';
import CommissionValidator from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as ICommissionUpdate;

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);
		// const { cryptoCurrency } = params;

		await Validator.isUserExists(adminId);
		await Validator.isAdmin(adminId);
		await CommissionValidator.update(params);
		// await CommissionValidator.isExists({ cryptoCurrency });

		const commissionService = new CommissionService();
		const doc = await commissionService.update(params);

		const dto = _.pick(doc, ['id', 'cryptoCurrency', 'commission']);
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

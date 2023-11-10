import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../common/errors';
import { IAdvertDelete } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { AdvertService } from '../../../services/advert/service';
import UserValidator from '../user/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IAdvertDelete;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		await Validator.delete(params);

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;
		const { id } = params;

		await UserValidator.isUserExists(userId);
		await Validator.isOwner({ userId, advertId: id });

		const advertService = new AdvertService();

		await advertService.delete(params);

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(204).json({ code: 204, message: 'no-content' });
	} catch (e) {
		next(e);
	}
};

export default route;

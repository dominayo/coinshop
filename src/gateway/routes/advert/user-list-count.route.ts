import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { AdvertService } from '../../../services/advert/service';
import UserValidator from '../user/validator';

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

		const advertService = new AdvertService();
		const advertCount = await advertService.countByOwnerId({ owner: userId });

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: { advertCount } });
	} catch (e) {
		next(e);
	}
};

export default route;

import { NextFunction, Request, Response } from 'express';
import { AdvertService } from '../../../services/advert/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const advertService = new AdvertService();
		const userADverts = await advertService.count({});

		res.status(200).json({ code: 200, message: { advertCount: userADverts } });
	} catch (e) {
		next(e);
	}
};

export default route;

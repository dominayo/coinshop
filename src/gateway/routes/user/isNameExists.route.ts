import { NextFunction, Request, Response } from 'express';
import { IIsNameExists } from './interface';
import { Validator } from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IIsNameExists;

		const isExists = await Validator.isUserNameExists(params);

		res.status(201).json({ code: 201, message: { isExists } });
	} catch (e) {
		next(e);
	}
};

export default route;
